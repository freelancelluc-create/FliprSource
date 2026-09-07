/**
 * Endpoint unificado de autenticación.
 * Enruta por ?action= o por el path final de la URL.
 *
 * POST /api/auth?action=login         { email, password } → { token, user }
 * POST /api/auth?action=register      { name, email, password, ref? } → { token, user }
 * POST /api/auth?action=logout        (Bearer) → { ok: true }
 * GET  /api/auth?action=me            (Bearer) → { user }
 * POST /api/auth?action=reset-password { email } | { token, newPassword }
 *
 * Mantiene compatibilidad con las rutas antiguas /api/auth/login, etc.,
 * que el frontend sigue usando (Vercel las mapea al mismo handler si se
 * usan rewrites, pero aquí derivamos por query param).
 */

import { kvGet, kvSet, kvDel } from "../lib/kv.js";
import { hashPassword, verifyPassword, newToken, newUserId } from "../lib/auth.js";
import { json, bearer, readBody } from "../lib/http.js";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

// ─── helpers ────────────────────────────────────────────────────────────────

function getAction(req) {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const a = url.searchParams.get("action");
    if (a) return a;
    // fallback: último segmento del path  (/api/auth/login → "login")
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

// ─── handlers ───────────────────────────────────────────────────────────────

async function handleLogin(req, res) {
  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL)
    return json(res, { error: "no-db" }, 503);

  const body = await readBody(req);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) return json(res, { error: "invalid-input" }, 400);

  const record = await kvGet(`user:${email}`);
  if (!record || !verifyPassword(password, record.salt, record.hash))
    return json(res, { error: "bad-credentials" }, 401);

  const token = newToken();
  await kvSet(`session:${token}`, { email });
  return json(res, { token, user: { id: record.id, name: record.name, email: record.email } });
}

async function handleRegister(req, res) {
  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL)
    return json(res, { error: "no-db" }, 503);

  const body = await readBody(req);
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const ref = String(body?.ref || "").trim().toLowerCase();

  if (!name || name.length < 2) return json(res, { error: "invalid-name" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, { error: "invalid-email" }, 400);
  if (password.length < 6) return json(res, { error: "short-password" }, 400);

  const existing = await kvGet(`user:${email}`);
  if (existing) return json(res, { error: "email-exists" }, 409);

  const { salt, hash } = hashPassword(password);
  const user = { id: newUserId(), name, email, salt, hash, createdAt: Date.now() };
  const savedUser = await kvSet(`user:${email}`, user);
  const stored = await kvGet(`user:${email}`);
  if (!savedUser || !stored) return json(res, { error: "db-error" }, 500);

  if (ref && ref !== email) {
    const refUser = await kvGet(`user:${ref}`);
    if (refUser) {
      const refData = (await kvGet(`data:${ref}`)) || {};
      const bonus = (parseInt(refData.credits, 10) || 0) + 5;
      await kvSet(`data:${ref}`, { ...refData, credits: bonus });
    }
  }

  const token = newToken();
  await kvSet(`session:${token}`, { email });
  return json(res, { token, user: { id: user.id, name: user.name, email: user.email } });
}

async function handleLogout(req, res) {
  const token = bearer(req);
  if (token) await kvDel(`session:${token}`);
  return json(res, { ok: true });
}

async function handleMe(req, res) {
  const token = bearer(req);
  if (!token) return json(res, { user: null });

  const session = await kvGet(`session:${token}`);
  if (!session?.email) return json(res, { user: null });

  const record = await kvGet(`user:${session.email}`);
  if (!record) return json(res, { user: null });

  return json(res, { user: { id: record.id, name: record.name, email: record.email } });
}

async function handleResetPassword(req, res) {
  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL)
    return json(res, { error: "no-db" }, 503);

  const body = await readBody(req);

  if (body?.token && body?.newPassword) {
    const rawToken = String(body.token).trim();
    const newPassword = String(body.newPassword);
    if (newPassword.length < 6) return json(res, { error: "short-password" }, 400);

    const record = await kvGet(`reset:${rawToken}`);
    if (!record?.email || !record?.expiresAt) return json(res, { error: "invalid-token" }, 400);
    if (Date.now() > record.expiresAt) {
      await kvDel(`reset:${rawToken}`);
      return json(res, { error: "expired-token" }, 400);
    }

    const user = await kvGet(`user:${record.email}`);
    if (!user) return json(res, { error: "not-found" }, 404);

    const { salt, hash } = hashPassword(newPassword);
    await kvSet(`user:${record.email}`, { ...user, salt, hash });
    await kvDel(`reset:${rawToken}`);
    return json(res, { ok: true });
  }

  if (body?.email) {
    const email = String(body.email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return json(res, { error: "invalid-email" }, 400);

    const user = await kvGet(`user:${email}`);
    if (!user) return json(res, { ok: true, sent: false });

    const token = newToken();
    await kvSet(`reset:${token}`, { email, expiresAt: Date.now() + TOKEN_TTL_MS });
    return json(res, { ok: true, sent: true, token });
  }

  return json(res, { error: "invalid-body" }, 400);
}

// ─── router ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  const action = getAction(req);

  if (action === "login")          return handleLogin(req, res);
  if (action === "register")       return handleRegister(req, res);
  if (action === "logout")         return handleLogout(req, res);
  if (action === "me")             return handleMe(req, res);
  if (action === "reset-password") return handleResetPassword(req, res);

  return json(res, { error: "unknown-action" }, 404);
}
