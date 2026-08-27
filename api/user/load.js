/**
 * Recupera los datos del usuario logueado.
 * GET (Bearer) -> { history, favorites, credits }
 */

import { kvGet } from "../../lib/kv.js";
import { json, bearer } from "../../lib/http.js";

export default async function handler(req, res) {
  const token = bearer(req);
  if (!token) return json(res, { error: "unauthorized" }, 401);

  const session = await kvGet(`session:${token}`);
  if (!session || !session.email) return json(res, { error: "unauthorized" }, 401);

  const data = (await kvGet(`data:${session.email}`)) || {};
  return json(res, {
    history: Array.isArray(data.history) ? data.history : [],
    favorites: Array.isArray(data.favorites) ? data.favorites : [],
    credits: Number.isFinite(Number(data.credits)) ? data.credits : null,
  });
}
