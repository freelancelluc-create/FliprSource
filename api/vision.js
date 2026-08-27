/**
 * Serverless Function de Vercel — Lectura de precio por Visión IA
 *
 * Recibe { imageDataUrl } y llama a OpenAI (modelo de visión) usando la clave
 * del servidor (process.env.OPENAI_API_KEY). Así la clave NUNCA se expone en el
 * navegador. Devuelve { ok, price, reason }.
 *
 * Nota: configura OPENAI_API_KEY en las variables de entorno de Vercel.
 */

import { json, readBody } from '../lib/http.js';

function normalizePrice(raw) {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).replace(/€|\s|EUR|euros?/gi, "").trim();
  if (!s || !/\d/.test(s)) return null;
  if (/^\d+(\.\d{2})?$/.test(s)) {
    s = s;
  } else if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+,\d{1,2}$/.test(s)) {
    s = s.replace(",", ".");
  } else {
    s = s.replace(/[^\d.]/g, "");
  }
  const n = parseFloat(s);
  if (Number.isFinite(n) && n > 0 && n < 1000000) return Math.round(n);
  return null;
}

export default async function handler(req, res) {
  const body = await readBody(req);
  const imageDataUrl = body?.imageDataUrl;

  if (!imageDataUrl) return json(res, { ok: false, reason: "no-image" }, 400);

  const key = process.env.OPENAI_API_KEY;
  if (!key) return json(res, { ok: false, reason: "no-key" }, 503);

  if (imageDataUrl.length > 6_000_000) return json(res, { ok: false, reason: "image-too-large" }, 413);

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Lee el precio de venta (en euros) del anuncio de esta imagen. Responde SOLO con el número entero, sin símbolos ni texto extra. Si no lo ves claro, responde NO_ENCUENTRO.",
              },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) return json(res, { ok: false, reason: "api-error:" + resp.status }, 502);

    const data = await resp.json();
    const content = (data?.choices?.[0]?.message?.content) || "";
    if (/NO_ENCUENTRO|no encuentro/i.test(content)) return json(res, { ok: false, reason: "no-price" });

    const price = normalizePrice(content);
    return price ? json(res, { ok: true, price }) : json(res, { ok: false, reason: "unparsed" });
  } catch (e) {
    console.log("Vision server error", e);
    return json(res, { ok: false, reason: "error" }, 502);
  }
}
