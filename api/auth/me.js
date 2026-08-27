/**
 * Devuelve el usuario actual (si el token de sesión es válido) o user:null.
 * GET (Bearer) -> { user } | { user: null }
 */

import { kvGet } from "../../lib/kv.js";
import { json, bearer } from "../../lib/http.js";

export default async function handler(req, res) {
  const token = bearer(req);
  if (!token) return json(res, { user: null });

  const session = await kvGet(`session:${token}`);
  if (!session || !session.email) return json(res, { user: null });

  const record = await kvGet(`user:${session.email}`);
  if (!record) return json(res, { user: null });

  return json(res, { user: { id: record.id, name: record.name, email: record.email } });
}
