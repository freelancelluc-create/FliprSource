/**
 * Cierre de sesión: invalida la sesión del token.
 * POST (Bearer) -> { ok: true }
 */

import { kvDel } from "../../lib/kv.js";
import { json, bearer } from "../../lib/http.js";

export default async function handler(req, res) {
  const token = bearer(req);
  if (token) await kvDel(`session:${token}`);
  return json(res, { ok: true });
}
