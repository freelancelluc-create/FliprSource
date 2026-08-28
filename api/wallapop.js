/**
 * Serverless Function de Vercel — Proxy de Wallapop (función plana, sin catch-all)
 *
 * El frontend llama a /api/wallapop?url=<url del anuncio>  y esta función lo
 * reenvía al host de Wallapop desde el servidor (evita CORS y hace que la lectura
 * de precio funcione también en producción, no solo en dev).
 *
 * NOTA: se usa como función plana (api/wallapop.js) porque Vercel no enrutaba
 * correctamente el catch-all /api/wallapop/[...path].js. El path va por query.
 *
 * Devuelve el HTML del anuncio tal cual; el parser del cliente (aiVisionParser)
 * extrae el precio de los datos estructurados (JSON-LD / meta / microdata).
 */

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export default async function handler(req, res) {
  let target = "";
  try {
    const url = new URL(req.url || "/", "http://localhost");
    target = url.searchParams.get("url") || "";
  } catch (e) {
    target = "";
  }

  // Solo permitimos URLs http(s) válidas de anuncio.
  if (!/^https?:\/\/([\w-]+\.)*wallapop\.com\//i.test(target) && !/^https?:\/\//i.test(target)) {
    res.status(400);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("bad-url");
    return;
  }

  try {
    const resp = await fetch(target, {
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
    });

    const body = await resp.text();
    res.status(resp.ok ? 200 : resp.status);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(body);
  } catch (e) {
    // Bloqueo de Cloudflare, red, etc. → devolvemos vacío y el cliente cae con elegancia
    console.log("Wallapop proxy error", e);
    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send("");
  }
}
