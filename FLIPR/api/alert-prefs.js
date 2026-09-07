/**
 * Gestión de preferencias de alertas de precio.
 *
 * GET  (Bearer) → { enabled, notifyEmail }
 * POST (Bearer) { enabled, notifyEmail } → { ok: true }
 */

import { kvGet, kvSet } from "../lib/kv.js";
import { json, bearer, readBody } from "../lib/http.js";

export default async function handler(req, res) {
  const token = bearer(req);
  if (!token) return json(res, { error: "unauthorized" }, 401);

  const session = await kvGet(`session:${token}`);
  if (!session?.email) return json(res, { error: "unauthorized" }, 401);

  const { email } = session;
  const key = `alert-prefs:${email}`;

  if (req.method === "GET") {
    const prefs = (await kvGet(key)) || { enabled: false, notifyEmail: email };
    return json(res, prefs);
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    const current = (await kvGet(key)) || {};

    const updated = {
      enabled: typeof body?.enabled === "boolean" ? body.enabled : current.enabled ?? false,
      notifyEmail:
        typeof body?.notifyEmail === "string" && body.notifyEmail.includes("@")
          ? body.notifyEmail.trim().toLowerCase()
          : current.notifyEmail || email,
    };

    await kvSet(key, updated);
    return json(res, { ok: true, prefs: updated });
  }

  return json(res, { error: "method-not-allowed" }, 405);
}
