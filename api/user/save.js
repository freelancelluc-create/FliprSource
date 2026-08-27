/**
 * Guarda los datos del usuario logueado.
 * POST (Bearer) { history, favorites, credits } -> { ok: true }
 */

import { kvGet, kvSet } from "../../lib/kv.js";
import { json, bearer, readBody } from "../../lib/http.js";

export default async function handler(req, res) {
  const token = bearer(req);
  if (!token) return json(res, { error: "unauthorized" }, 401);

  const session = await kvGet(`session:${token}`);
  if (!session || !session.email) return json(res, { error: "unauthorized" }, 401);

  const body = await readBody(req);
  const data = {
    history: Array.isArray(body?.history) ? body.history : [],
    favorites: Array.isArray(body?.favorites) ? body.favorites : [],
    credits: Number.isFinite(Number(body?.credits)) ? Number(body.credits) : null,
  };

  await kvSet(`data:${session.email}`, data);
  return json(res, { ok: true });
}
