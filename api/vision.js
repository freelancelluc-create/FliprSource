/**
 * Serverless Function de Vercel — Lectura de precio por Visión IA
 *
 * Recibe { imageDataUrl } y llama a OpenAI (modelo de visión) usando la clave
 * del servidor (process.env.OPENAI_API_KEY). Así la clave NUNCA se expone en el
 * navegador. Devuelve { ok, price, reason }.
 *
 * Nota: para que funcione, configura OPENAI_API_KEY en las variables de entorno
 * de Vercel (no en el código).
 */

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

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export default async function handler(request) {
  let imageDataUrl;
  try {
    const body = await request.json();
    imageDataUrl = body && body.imageDataUrl;
  } catch (e) {
    imageDataUrl = null;
  }

  if (!imageDataUrl) return json({ ok: false, reason: "no-image" });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return json({ ok: false, reason: "no-key" });

  // Límite de tamaño del cuerpo (Vercel ~4.5 MB); protegemos con margen.
  if (imageDataUrl.length > 6_000_000) return json({ ok: false, reason: "image-too-large" });

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

    if (!resp.ok) return json({ ok: false, reason: "api-error:" + resp.status });

    const data = await resp.json();
    const content = (data?.choices?.[0]?.message?.content) || "";
    if (/NO_ENCUENTRO|no encuentro/i.test(content)) return json({ ok: false, reason: "no-price" });

    const price = normalizePrice(content);
    return price ? json({ ok: true, price }) : json({ ok: false, reason: "unparsed" });
  } catch (e) {
    console.log("Vision server error", e);
    return json({ ok: false, reason: "error" });
  }
}
