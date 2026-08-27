/**
 * Registro de usuario.
 * POST { name, email, password } -> { token, user }
 * Guarda el usuario en Vercel KV y crea una sesión.
 */

import { kvGet, kvSet } from "../../lib/kv.js";
import { hashPassword, newToken, newUserId } from "../../lib/auth.js";
import { json, readBody } from "../../lib/http.js";

export default async function handler(req, res) {
  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return json(res, { error: "no-db" }, 503);
  }

  const body = await readBody(req);
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!name || name.length < 2) return json(res, { error: "invalid-name" }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json(res, { error: "invalid-email" }, 400);
  if (password.length < 6) return json(res, { error: "short-password" }, 400);

  const existing = await kvGet(`user:${email}`);
  if (existing) return json(res, { error: "email-exists" }, 409);

  const { salt, hash } = hashPassword(password);
  const user = { id: newUserId(), name, email, salt, hash, createdAt: Date.now() };
  const savedUser = await kvSet(`user:${email}`, user);

  // Comprobar que se guardó de verdad; si no, avisar
  const stored = await kvGet(`user:${email}`);
  if (!savedUser || !stored) {
    return json(res, { error: "db-error" }, 500);
  }

  const token = newToken();
  await kvSet(`session:${token}`, { email });

  return json(res, { token, user: { id: user.id, name: user.name, email: user.email } });
}
