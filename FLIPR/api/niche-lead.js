/**
 * Test de validación de nichos: cuenta visitas y guarda mensajes.
 *
 * POST { type: "view",    niche, src }                      -> cuenta una visita
 * POST { type: "message", niche, src, item, contact, note } -> guarda un mensaje
 * GET  ?niche=lego (header x-admin-key = NICHE_ADMIN_KEY)   -> resumen y mensajes
 *
 * La métrica del test es la de mensajes: una persona que describe un producto
 * concreto y deja un contacto para recibir el análisis.
 */

import { kvIncr, kvRpush, kvLrange, kvGet } from "../lib/kv.js";
import { json, readBody } from "../lib/http.js";
import { checkRateLimit, getClientIp } from "../lib/rateLimit.js";

const NICHES = new Set(["lego", "cartas", "retro", "gpu", "sneakers"]);

// Solo letras, números y guiones; evita claves raras en Redis.
function slug(value, max = 40) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, max);
}

function clean(value, max) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const adminKey = process.env.NICHE_ADMIN_KEY;
    const sent = (req.headers && req.headers["x-admin-key"]) || "";
    if (!adminKey || sent !== adminKey) return json(res, { error: "unauthorized" }, 401);

    const url = new URL(req.url, "http://localhost");
    const niche = slug(url.searchParams.get("niche"));
    if (!NICHES.has(niche)) return json(res, { error: "bad-niche" }, 400);

    const views = Number(await kvGet(`niche:${niche}:views`)) || 0;
    const messages = await kvLrange(`niche:${niche}:messages`);
    const rate = views > 0 ? Math.round((messages.length / views) * 1000) / 10 : 0;
    return json(res, { niche, views, messageCount: messages.length, ratePercent: rate, messages });
  }

  if (req.method !== "POST") return json(res, { error: "method-not-allowed" }, 405);

  const body = await readBody(req);
  const niche = slug(body?.niche);
  if (!NICHES.has(niche)) return json(res, { error: "bad-niche" }, 400);

  const src = slug(body?.src) || "directo";
  const ip = getClientIp(req);

  if (body?.type === "view") {
    const rl = await checkRateLimit(`niche-view:${ip}`, { maxRequests: 30, windowSecs: 3600 });
    if (!rl.allowed) return json(res, { ok: true });
    await kvIncr(`niche:${niche}:views`);
    await kvIncr(`niche:${niche}:views:${src}`);
    return json(res, { ok: true });
  }

  if (body?.type === "message") {
    const rl = await checkRateLimit(`niche-msg:${ip}`, { maxRequests: 5, windowSecs: 3600 });
    if (!rl.allowed) return json(res, { error: "rate-limited" }, 429);

    const item = clean(body?.item, 200);
    const contact = clean(body?.contact, 120);
    const note = clean(body?.note, 500);

    if (item.length < 3) return json(res, { error: "item-required" }, 400);
    if (contact.length < 3) return json(res, { error: "contact-required" }, 400);

    const saved = await kvRpush(`niche:${niche}:messages`, {
      at: new Date().toISOString(),
      src,
      item,
      contact,
      note,
    });
    if (!saved) return json(res, { error: "storage-unavailable" }, 503);

    await kvIncr(`niche:${niche}:messages:${src}`);
    return json(res, { ok: true });
  }

  return json(res, { error: "bad-type" }, 400);
}
