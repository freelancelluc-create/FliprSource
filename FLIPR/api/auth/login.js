/**
 * Inicio de sesión.
 * POST { email, password } -> { token, user } o error.
 */

import { kvGet, kvSet } from "../../lib/kv.js";
import { verifyPassword, newToken } from "../../lib/auth.js";
import { json, readBody } from "../../lib/http.js";

export default async function handler(req, res) {
  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return json(res, { error: "no-db" }, 503);
  }

  const body = await readBody(req);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email || !password) return json(res, { error: "invalid-input" }, 400);

  const record = await kvGet(`user:${email}`);
  if (!record || !verifyPassword(password, record.salt, record.hash)) {
    return json(res, { error: "bad-credentials" }, 401);
  }

  const token = newToken();
  await kvSet(`session:${token}`, { email });

  return json(res, { token, user: { id: record.id, name: record.name, email: record.email } });
}
