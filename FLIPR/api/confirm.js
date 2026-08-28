/**
 * Serverless Function de Vercel — Confirmación del pago
 *
 * Tras pagar en Stripe, el navegador vuelve a la app con ?session_id=... .
 * Consulta a Stripe y, si el pago está pagado, devuelve los créditos comprados.
 */

import { json } from '../lib/http.js';

export default async function handler(req, res) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(res, { ok: false, error: "no-stripe" }, 503);

  const sessionId = new URL(req.url || "/", `http://${(req.headers && req.headers.host) || "x"}`).searchParams.get("session_id");
  if (!sessionId) return json(res, { ok: false, error: "no-session" }, 400);

  try {
    const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { "Authorization": `Bearer ${key}` },
    });
    const data = await resp.json();

    if (data && data.payment_status === "paid" && data.metadata && data.metadata.credits) {
      return json(res, { ok: true, credits: parseInt(data.metadata.credits, 10) });
    }
    return json(res, { ok: false });
  } catch (e) {
    console.log("Stripe confirm error", e);
    return json(res, { ok: false, error: "error" }, 502);
  }
}
