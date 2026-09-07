/**
 * Endpoint unificado de datos de usuario.
 *
 * GET  /api/user?action=load  (Bearer) → { history, favorites, watchlist, credits, alertEmail }
 * POST /api/user?action=save  (Bearer) { history, favorites, watchlist, credits, alertEmail? }
 */

import { kvGet, kvSet } from "../lib/kv.js";
import { json, bearer, readBody } from "../lib/http.js";

function getAction(req) {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const a = url.searchParams.get("action");
    if (a) return a;
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

async function handleLoad(req, res) {
  const token = bearer(req);
  if (!token) return json(res, { error: "unauthorized" }, 401);

  const session = await kvGet(`session:${token}`);
  if (!session?.email) return json(res, { error: "unauthorized" }, 401);

  const data = (await kvGet(`data:${session.email}`)) || {};
  return json(res, {
    history: Array.isArray(data.history) ? data.history : [],
    favorites: Array.isArray(data.favorites) ? data.favorites : [],
    watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
    credits: Number.isFinite(Number(data.credits)) ? data.credits : null,
    alertEmail: typeof data.alertEmail === "string" ? data.alertEmail : null,
  });
}

async function handleSave(req, res) {
  const token = bearer(req);
  if (!token) return json(res, { error: "unauthorized" }, 401);

  const session = await kvGet(`session:${token}`);
  if (!session?.email) return json(res, { error: "unauthorized" }, 401);

  const body = await readBody(req);
  const data = {
    history: Array.isArray(body?.history) ? body.history : [],
    favorites: Array.isArray(body?.favorites) ? body.favorites : [],
    watchlist: Array.isArray(body?.watchlist) ? body.watchlist : [],
    credits: Number.isFinite(Number(body?.credits)) ? Number(body.credits) : null,
    alertEmail: typeof body?.alertEmail === "string" ? body.alertEmail.trim().toLowerCase() : null,
  };

  await kvSet(`data:${session.email}`, data);
  return json(res, { ok: true });
}

export default async function handler(req, res) {
  const action = getAction(req);

  if (action === "load") return handleLoad(req, res);
  if (action === "save") return handleSave(req, res);

  return json(res, { error: "unknown-action" }, 404);
}
