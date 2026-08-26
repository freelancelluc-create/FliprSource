/**
 * Serverless Function de Vercel — Confirmación del pago
 *
 * Tras pagar en Stripe, el navegador vuelve a la app con ?session_id=... .
 * Esta función consulta a Stripe y, si el pago está pagado, devuelve los
 * créditos del plan comprado (para que el cliente los abone en su saldo).
 */

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export default async function handler(request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json({ ok: false, error: "no-stripe" });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return json({ ok: false, error: "no-session" });

  try {
    const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { "Authorization": `Bearer ${key}` },
    });
    const data = await resp.json();

    if (data && data.payment_status === "paid" && data.metadata && data.metadata.credits) {
      return json({ ok: true, credits: parseInt(data.metadata.credits, 10) });
    }
    return json({ ok: false });
  } catch (e) {
    console.log("Stripe confirm error", e);
    return json({ ok: false, error: "error" });
  }
}
