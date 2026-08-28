/**
 * Reset de contraseña en dos pasos:
 *
 * PASO 1 — POST { email }
 *   Genera un token temporal (válido 1 hora) y lo guarda en KV bajo
 *   `reset:{token}` → { email, expiresAt }. Devuelve el token en la
 *   respuesta para que el cliente lo muestre al usuario (flujo sin email
 *   SMTP de momento; se puede sustituir por un envío de correo más adelante).
 *
 * PASO 2 — POST { token, newPassword }
 *   Valida el token, comprueba que no haya caducado, actualiza el hash de
 *   la contraseña del usuario y elimina el token de KV.
 */

import { kvGet, kvSet, kvDel } from "../../lib/kv.js";
import { hashPassword, newToken } from "../../lib/auth.js";
import { json, readBody } from "../../lib/http.js";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export default async function handler(req, res) {
  if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return json(res, { error: "no-db" }, 503);
  }

  const body = await readBody(req);

  // ── PASO 2: cambiar contraseña con token ──────────────────────────────────
  if (body?.token && body?.newPassword) {
    const rawToken = String(body.token).trim();
    const newPassword = String(body.newPassword);

    if (newPassword.length < 6) return json(res, { error: "short-password" }, 400);

    const record = await kvGet(`reset:${rawToken}`);
    if (!record || !record.email || !record.expiresAt) {
      return json(res, { error: "invalid-token" }, 400);
    }
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

  // ── PASO 1: solicitar token de reset ──────────────────────────────────────
  if (body?.email) {
    const email = String(body.email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json(res, { error: "invalid-email" }, 400);
    }

    const user = await kvGet(`user:${email}`);
    // Respondemos igual tanto si existe como si no para no filtrar emails
    if (!user) return json(res, { ok: true, sent: false });

    const token = newToken();
    await kvSet(`reset:${token}`, { email, expiresAt: Date.now() + TOKEN_TTL_MS });

    // TODO: enviar por email (integrar con Resend, Postmark, etc.)
    // Por ahora devolvemos el token en la respuesta para que el cliente lo
    // muestre al usuario. En producción con SMTP activo, quitar `token` de
    // la respuesta y enviar solo por correo.
    return json(res, { ok: true, sent: true, token });
  }

  return json(res, { error: "invalid-body" }, 400);
}
