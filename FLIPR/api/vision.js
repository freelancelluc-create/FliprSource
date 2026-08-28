/**
 * Serverless Function de Vercel — Lectura de datos del anuncio por Visión IA
 *
 * Recibe { imageDataUrl } y llama a un modelo de visión usando la clave del
 * servidor (la clave NUNCA se expone en el navegador). Devuelve
 * { ok, title, price, condition, description, reason }.
 *
 * PROVEEDOR (se elige según la clave que exista en Vercel):
 *   - Si OPENROUTER_API_KEY está definida → OpenRouter (recomendado, cuota propia).
 *     Modelo configurable vía OPENROUTER_MODEL (por defecto "openai/gpt-4o-mini").
 *   - Si NO, y OPENAI_API_KEY está definida → OpenAI.
 *     Modelo configurable vía OPENAI_VISION_MODEL (por defecto "gpt-4o-mini").
 *   - Si no hay ninguna → "no-key".
 *
 * Mejoras de fiabilidad:
 *   - response_format: json_object → JSON válido garantizado (si el modelo lo soporta).
 *   - detail: "high" → el modelo lee mejor el texto pequeño de la captura.
 *   - Extracción de JSON robusta frente a "```json" o texto extra.
 *   - Normalización de precio defensiva (miles, decimales, rangos "5500 - 6000").
 *   - Guardia anti-confusión: si el "precio" es en realidad el año, se descarta.
 */

import { json, readBody, bearer } from '../lib/http.js';
import { checkRateLimit, getClientIp } from '../lib/rateLimit.js';

export function normalizePrice(raw) {
  if (raw === null || raw === undefined) return null;
  // Reemplazamos símbolos por espacio para poder detectar rangos ANTES de quitar espacios.
  let s = String(raw).replace(/€|EUR|euros?/gi, " ").trim();
  if (!s || !/\d/.test(s)) return null;

  // Rango "5500 - 6000" / "5500 a 6000" / "5500–6000" -> conservamos la primera cifra.
  s = s.replace(/\s*[-–—]\s*\d[\d.,]*\s*$/g, "").replace(/\s+a\s+\d[\d.,]*\s*$/gi, "").trim();

  // Quitamos espacios restantes (distintos de los de miles) y cualquier símbolo residual.
  s = s.replace(/\s+/g, "");

  let n;
  if (/^\d+(\.\d{2})?$/.test(s)) {
    n = parseFloat(s); // entero o decimal con punto
  } else if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) {
    n = parseFloat(s.replace(/\./g, "").replace(",", ".")); // "1.234,56" / "1.234"
  } else if (/^\d+,\d{1,2}$/.test(s)) {
    n = parseFloat(s.replace(",", ".")); // "1234,56"
  } else {
    n = parseFloat(s.replace(/[^\d.]/g, ""));
  }
  if (Number.isFinite(n) && n > 0 && n < 1000000) return Math.round(n);
  return null;
}

/** Extrae el primer objeto JSON balanceado de un texto (ignora "```json" y texto extra). */
export function extractJsonObject(text) {
  if (!text) return null;
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  const start = t.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = t.slice(start, i + 1);
        try { return JSON.parse(candidate); } catch { return null; }
      }
    }
  }
  return null;
}

const VALID_CONDITIONS = ["Nuevo", "Como nuevo", "Muy buen estado", "Buen estado", "Aceptable"];

/**
 * Detecta si un precio parece realmente el AÑO del vehículo/producto (confusión
 * habitual de los modelos: leen "1998" de "BMW Serie 5 1998" y lo dan como precio).
 * Solo devuelve true si el precio es un número de 4 cifras en rango de año (1900-2030)
 * y además esa misma cifra aparece en el título o la descripción.
 */
export function looksLikeYear(price, text) {
  if (price === null || price === undefined) return false;
  const p = Number(price);
  if (!Number.isInteger(p) || p < 1900 || p > 2030) return false;
  return new RegExp(`\\b${p}\\b`).test(String(text || ""));
}

export default async function handler(req, res) {
  // Rate limiting: 20 req/hora por IP anónima, 60 req/hora con token de sesión.
  const token = bearer(req);
  const rlKey = token ? `tok:${token.slice(0, 16)}` : `ip:${getClientIp(req)}`;
  const maxReq = token ? 60 : 20;
  const rl = await checkRateLimit(rlKey, { maxRequests: maxReq, windowSecs: 3600 });
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.resetIn));
    return json(res, { ok: false, reason: "rate-limited", resetIn: rl.resetIn }, 429);
  }

  const body = await readBody(req);
  const imageDataUrl = body?.imageDataUrl;

  if (!imageDataUrl) return json(res, { ok: false, reason: "no-image" }, 400);

  // Elegimos el proveedor según la clave disponible en Vercel.
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openrouterKey && !openaiKey) return json(res, { ok: false, reason: "no-key" }, 503);

  if (imageDataUrl.length > 8_000_000) return json(res, { ok: false, reason: "image-too-large" }, 413);

  const useOpenRouter = !!openrouterKey;
  const model = useOpenRouter
    ? (process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini")
    : (process.env.OPENAI_VISION_MODEL || "gpt-4o-mini");
  const endpoint = useOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const headers = useOpenRouter
    ? {
        "Authorization": `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://fliprscore.com",
        "X-Title": "FLIPR",
      }
    : { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" };

  const prompt = `Eres un analizador de anuncios de segunda mano a partir de una captura de pantalla de Wallapop, Vinted o Facebook Marketplace.
Tienes que leer el NOMBRE del producto y su PRECIO DE VENTA en euros.
- El PRECIO es la cantidad que aparece INMEDIATAMENTE junto al símbolo € (ej. "5500 €", "€ 5.500", "5.500€"). Normalmente está en la tarjeta del anuncio, bajo el título.
- NO confundas el precio con el AÑO del producto (ej. "1998", "2015"), con los KILÓMETROS (ej. "210000 km") ni con la valoración. Si un número de 4 cifras aparece como año o como km, NO es el precio.
- Si no encuentras un número claramente acompañado de €, pon price a null.
Responde ÚNICAMENTE con JSON válido, sin texto fuera de él, con esta forma exacta:
{"title":"<nombre y modelo del producto, sin la palabra 'Precio' ni el importe>","price":<precio entero en euros o null>,"condition":"<Nuevo | Como nuevo | Muy buen estado | Buen estado | Aceptable>","description":"<breve descripción del estado y características: condición, año aproximado, kilómetros, si le falta algo o si hay que repararlo>"}
Usa siempre comillas dobles. Si no estás seguro del precio, pon null antes que inventar una cifra.`;

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature: 0,
        ...(useOpenRouter ? {} : { response_format: { type: "json_object" } }),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) return json(res, { ok: false, reason: "api-error:" + resp.status }, 502);

    const data = await resp.json();
    const content = (data?.choices?.[0]?.message?.content) || "";

    const parsed = extractJsonObject(content);

    const title = String(parsed?.title || "").trim().slice(0, 120);
    let price = normalizePrice(parsed && parsed.price);
    const condition = VALID_CONDITIONS.includes(String(parsed?.condition || "").trim())
      ? String(parsed.condition).trim()
      : null;
    const description = String(parsed?.description || "").trim().slice(0, 500);

    // Guardia anti-confusión: si el "precio" es en realidad el AÑO del producto
    // (ej. detecta "1998" y además aparece en el título/descripción), lo descartamos
    // para NO rellenar el precio con el año del coche; el usuario lo pone a mano.
    let reason = null;
    if (price && looksLikeYear(price, `${title} ${description}`)) {
      price = null;
      reason = "year-confusion";
    }

    if (title || price || description) {
      return json(res, { ok: true, title, price, condition, description, reason });
    }
    return json(res, { ok: false, reason: "unparsed" });
  } catch (e) {
    console.log("Vision server error", e);
    return json(res, { ok: false, reason: "error" }, 502);
  }
}