/**
 * Serverless Function de Vercel — Inicio de pago con Stripe Checkout
 *
 * Crea una Checkout Session en Stripe (página de pago alojada) y devuelve la URL
 * a la que el navegador redirige. Stripe Checkout muestra automáticamente
 * Google Pay / Apple Pay según el dispositivo del comprador.
 *
 * Requiere la variable de entorno STRIPE_SECRET_KEY (clave de servidor de Stripe).
 * El importe se toma SIEMPRE de src/data/plans.js (nunca del cliente).
 */

import { findPlan } from '../src/data/plans.js';
import { json, readBody, originOf, bearer } from '../lib/http.js';
import { kvGet } from '../lib/kv.js';

export default async function handler(req, res) {
  // Solo POST
  if (req.method && req.method !== 'POST') {
    return json(res, { error: "method-not-allowed" }, 405);
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(res, { error: "no-stripe" }, 503);

  const body = await readBody(req);
  const plan = findPlan(body?.planId);
  if (!plan) return json(res, { error: "invalid-plan" }, 400);

  // Validación de sesión opcional: si hay token, verificamos que existe en KV
  // (evita crear sesiones de Stripe para tokens de sesión falsos)
  const token = bearer(req);
  if (token) {
    const session = await kvGet(`session:${token}`).catch(() => null);
    if (!session) return json(res, { error: "unauthorized" }, 401);
  }

  const origin = originOf(req);

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/#creditos`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "eur");
  params.set("line_items[0][price_data][product_data][name]", `${plan.credits} créditos FLIPR`);
  params.set("line_items[0][price_data][unit_amount]", String(Math.round(plan.price * 100)));
  params.set("metadata[planId]", plan.id);
  params.set("metadata[credits]", String(plan.credits));

  try {
    const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await resp.json();
    if (!resp.ok || !data.url) {
      console.log("Stripe checkout error", resp.status, data);
      return json(res, { error: "stripe-error", detail: (data && data.error && data.error.message) || ("HTTP " + resp.status) }, 502);
    }
    return json(res, { url: data.url });
  } catch (e) {
    console.log("Stripe checkout exception", e);
    return json(res, { error: "stripe-error", detail: e && e.message }, 502);
  }
}
