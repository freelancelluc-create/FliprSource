/**
 * Serverless Function de Vercel — Análisis del anuncio por IA (texto)
 *
 * Recibe { title, description } y un modelo de lenguaje razona sobre el texto
 * del vendedor para determinar el ESTADO REAL del producto, si necesita
 * reparación, si tuvo un accidente, desperfectos y kilometraje.
 *
 * Así evitamos los fallos de "no se fija en la descripción": la IA entiende
 * frases como "tuvo un accidente, hay que cambiar la horquilla" y responde
 * con un estado "A reparar" razonado, no con listas de palabras clave.
 *
 * Proveedor: OpenRouter (si OPENROUTER_API_KEY) con modelo OPENROUTER_MODEL
 * (por defecto "openai/gpt-4o-mini"); si no, OpenAI con OPENAI_VISION_MODEL.
 */

import { json, readBody, bearer } from '../lib/http.js';
import { extractJsonObject } from './vision.js';
import { inferConditionFromDescription } from '../src/utils/flipCalculator.js';
import { checkRateLimit, getClientIp } from '../lib/rateLimit.js';

const VALID_CONDITIONS = ["Nuevo", "Como nuevo", "Muy buen estado", "Buen estado", "Aceptable", "A reparar"];

export default async function handler(req, res) {
  // Rate limiting: 30 req/hora por IP anónima, 80 req/hora con token de sesión.
  const token = bearer(req);
  const rlKey = token ? `tok:${token.slice(0, 16)}` : `ip:${getClientIp(req)}`;
  const maxReq = token ? 80 : 30;
  const rl = await checkRateLimit(rlKey, { maxRequests: maxReq, windowSecs: 3600 });
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.resetIn));
    return json(res, { ok: false, reason: "rate-limited", resetIn: rl.resetIn }, 429);
  }

  const body = await readBody(req);
  const title = String(body?.title || "").trim().slice(0, 150);
  const description = String(body?.description || "").trim().slice(0, 2500);

  if (!title && !description) return json(res, { ok: false, reason: "no-text" }, 400);

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openrouterKey && !openaiKey) return json(res, { ok: false, reason: "no-key" }, 503);

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

  const prompt = `Eres un tasador experto de anuncios de segunda mano de Wallapop/Vinted.
Lee el TÍTULO y la DESCRIPCIÓN del vendedor y determina el ESTADO REAL del producto y sus problemas.
NO te fíes de etiquetas bonitas: razona sobre lo que dice la descripción. Si menciona avería, accidente, no funciona, reparar o cambiar piezas (horquilla, motor, batería, pantalla, embrague...), chapa, golpes, pintura dañada, desperfectos, falta una pieza, "se vende entera", etc. -> el estado baja a "A reparar" o "Aceptable".
Si NO menciona nada malo, usa "Muy buen estado" (o mejor si dice "como nuevo"/"impecable").
Responde ÚNICAMENTE con JSON válido y sin texto fuera, con esta forma:
{"condition":"<Nuevo | Como nuevo | Muy buen estado | Buen estado | Aceptable | A reparar>","needsRepair":true|false,"hasAccident":true|false,"defects":["<desperfecto 1>","<desperfecto 2>"],"km":<número de km si lo menciona, si no null>,"summary":"<frase corta en español explicando el motivo>"}
TÍTULO: ${title}
DESCRIPCIÓN: ${description}`;

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!resp.ok) {
      // Límite de peticiones del modelo gratis o error: caemos a la inferencia local
      const fb = inferConditionFromDescription(title + " " + description);
      if (fb) return json(res, { ok: true, condition: fb, needsRepair: fb === "A reparar", hasAccident: /accidente|accidentado|siniestro/i.test(title + " " + description), defects: fb === "A reparar" ? ["Avería o desperfecto descrito en el anuncio"] : [], km: null, summary: `Estado inferido por palabras clave (${fb}). La IA está limitada (HTTP ${resp.status}).` });
      return json(res, { ok: false, reason: "api-error:" + resp.status }, 502);
    }

    const data = await resp.json();
    const content = (data?.choices?.[0]?.message?.content) || "";
    const parsed = extractJsonObject(content);
    if (!parsed) {
      const fb = inferConditionFromDescription(title + " " + description);
      if (fb) return json(res, { ok: true, condition: fb, needsRepair: fb === "A reparar", hasAccident: /accidente|accidentado|siniestro/i.test(title + " " + description), defects: [], km: null, summary: `Estado inferido por palabras clave (${fb}).` });
      return json(res, { ok: false, reason: "unparsed" });
    }

    const condition = VALID_CONDITIONS.includes(String(parsed.condition || "").trim())
      ? String(parsed.condition).trim()
      : null;
    const km = Number.isFinite(Number(parsed.km)) && Number(parsed.km) > 0 ? Math.round(Number(parsed.km)) : null;

    return json(res, {
      ok: true,
      condition,
      needsRepair: !!parsed.needsRepair,
      hasAccident: !!parsed.hasAccident,
      defects: Array.isArray(parsed.defects) ? parsed.defects.slice(0, 6).map((d) => String(d).slice(0, 80)) : [],
      km,
      summary: String(parsed.summary || "").trim().slice(0, 200),
    });
  } catch (e) {
    console.log("Analyze server error", e);
    return json(res, { ok: false, reason: "error" }, 502);
  }
}
