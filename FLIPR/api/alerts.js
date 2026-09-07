/**
 * Vercel Cron Job — Alertas automáticas de precio para la watchlist de FLIPR.
 *
 * Se ejecuta cada hora (configurado en vercel.json).
 * Para cada usuario con alertas activas:
 *   1. Lee su watchlist desde Redis
 *   2. Comprueba el precio actual de cada item con URL de Wallapop
 *   3. Si el precio actual <= maxRecommendedBuy → envía email de alerta vía Resend
 *
 * Protegido por CRON_SECRET para evitar ejecuciones no autorizadas.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ─── helpers ────────────────────────────────────────────────────────────────

function json(res, body, status = 200) {
  res.status(status).setHeader("Content-Type", "application/json").end(JSON.stringify(body));
}

/** Obtiene el precio actual de un anuncio de Wallapop via proxy interno. */
async function fetchCurrentPrice(itemUrl) {
  if (!itemUrl || !itemUrl.includes("wallapop")) return null;
  try {
    const resp = await fetch(`${BASE_URL}/api/wallapop?url=${encodeURIComponent(itemUrl)}`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    return extractPriceFromHtml(html);
  } catch (e) {
    console.log("fetchCurrentPrice error", e?.message);
    return null;
  }
}

/** Extrae el precio de un HTML (mismo parser que aiVisionParser.js del cliente). */
function extractPriceFromHtml(html) {
  if (!html) return null;
  const tries = [
    /"offers"\s*:\s*\{[^}]*?"priceCurrency"\s*:\s*"EUR"[^}]*?"price"\s*:\s*"?([\d.,]+)"?/i,
    /"offers"\s*:\s*\{[^}]*?"price"\s*:\s*"?([\d.,]+)"?/i,
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']?([\d.,]+)/i,
    /itemprop=["']price["'][^>]*content=["']?([\d.,]+)/i,
  ];
  for (const re of tries) {
    const m = html.match(re);
    if (m?.[1]) {
      const raw = m[1].replace(",", ".");
      const p = parseFloat(raw);
      if (p >= 5 && p <= 100000) return p;
    }
  }
  return null;
}

/** Envía el email de alerta vía Resend. */
async function sendAlertEmail({ to, productName, currentPrice, targetPrice, productUrl }) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY no configurada — email no enviado");
    return false;
  }

  const savings = targetPrice - currentPrice;
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0f18;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0f18;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#12151f;border-radius:16px;border:1px solid #1e2130;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">⚡ FLIPR — Alerta de precio</p>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Un producto de tu watchlist ha bajado de precio</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Producto</p>
          <p style="margin:0 0 24px;font-size:20px;font-weight:800;color:#fff;">${productName}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="48%" style="background:#1a1d2e;border-radius:12px;padding:16px;text-align:center;">
                <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:700;">Precio actual</p>
                <p style="margin:0;font-size:28px;font-weight:900;color:#10b981;">${currentPrice} €</p>
              </td>
              <td width="4%"></td>
              <td width="48%" style="background:#1a1d2e;border-radius:12px;padding:16px;text-align:center;">
                <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:700;">Tu precio objetivo</p>
                <p style="margin:0;font-size:28px;font-weight:900;color:#fff;">${targetPrice} €</p>
              </td>
            </tr>
          </table>

          ${savings > 0 ? `<div style="background:#10b98115;border:1px solid #10b98130;border-radius:10px;padding:12px 16px;margin-bottom:24px;">
            <p style="margin:0;font-size:14px;color:#10b981;font-weight:700;">🎯 Estás ahorrando ${savings.toFixed(0)} € respecto a tu precio objetivo</p>
          </div>` : ''}

          <a href="${productUrl || 'https://fliprscore.com'}" style="display:block;background:#10b981;color:#000;font-size:15px;font-weight:800;text-align:center;padding:14px 24px;border-radius:10px;text-decoration:none;margin-bottom:16px;">
            Ver anuncio →
          </a>
          <a href="https://fliprscore.com" style="display:block;background:#1a1d2e;color:#9ca3af;font-size:13px;font-weight:600;text-align:center;padding:12px 24px;border-radius:10px;text-decoration:none;">
            Ir a mi watchlist en FLIPR
          </a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #1e2130;">
          <p style="margin:0;font-size:11px;color:#4b5563;text-align:center;">
            Recibiste este email porque activaste alertas de precio en <a href="https://fliprscore.com" style="color:#10b981;text-decoration:none;">fliprscore.com</a>.
            <br>Para desactivar las alertas, ve a tu panel en FLIPR.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FLIPR Alertas <onboarding@resend.dev>",
        to: [to],
        subject: `⚡ ${productName} — precio bajó a ${currentPrice} €`,
        html,
      }),
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      console.log("Resend error", data);
      return false;
    }
    return true;
  } catch (e) {
    console.log("sendAlertEmail error", e?.message);
    return false;
  }
}

// ─── KV helpers (inlined para no importar lib/kv desde cron) ────────────────

const KV_BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvCmd(command) {
  if (!KV_BASE || !KV_TOKEN) return null;
  try {
    const r = await fetch(KV_BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!r.ok) return null;
    return await r.json().catch(() => null);
  } catch (e) {
    return null;
  }
}

async function kvGet(key) {
  const d = await kvCmd(["GET", key]);
  const raw = d?.result;
  if (raw == null) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}

async function kvSet(key, value) {
  const d = await kvCmd(["SET", key, JSON.stringify(value)]);
  return !!d && d.result !== undefined;
}

/** Lista todas las claves que empiezan con un prefijo usando SCAN. */
async function kvScan(pattern) {
  const keys = [];
  let cursor = "0";
  do {
    const d = await kvCmd(["SCAN", cursor, "MATCH", pattern, "COUNT", "100"]);
    if (!d?.result) break;
    cursor = String(d.result[0]);
    if (Array.isArray(d.result[1])) keys.push(...d.result[1]);
  } while (cursor !== "0");
  return keys;
}

// ─── Handler principal ──────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Verificar que la petición viene del cron de Vercel o tiene el secret correcto
  const authHeader = req.headers["authorization"];
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return json(res, { error: "unauthorized" }, 401);
  }

  console.log("[alerts-cron] Iniciando revisión de watchlists...");

  // Buscar todos los usuarios con alertas activas: clave alert-prefs:{email}
  const prefKeys = await kvScan("alert-prefs:*");
  console.log(`[alerts-cron] ${prefKeys.length} usuarios con prefs de alertas`);

  let emailsSent = 0;
  let checked = 0;

  for (const prefKey of prefKeys) {
    const prefs = await kvGet(prefKey);
    if (!prefs?.enabled) continue;

    const email = prefKey.replace("alert-prefs:", "");
    const userData = await kvGet(`data:${email}`);
    const watchlist = Array.isArray(userData?.watchlist) ? userData.watchlist : [];

    if (watchlist.length === 0) continue;

    // Clave para evitar spam: solo alerta una vez cada 24h por producto
    const alertedKey = `alerted:${email}`;
    const alerted = (await kvGet(alertedKey)) || {};

    const now = Date.now();
    const TWENTY_FOUR_H = 24 * 60 * 60 * 1000;

    for (const item of watchlist) {
      checked++;
      if (!item.sourceUrl) continue; // sin URL no podemos revisar precio en tiempo real

      // ¿Ya alertamos por este producto hace menos de 24h?
      if (alerted[item.id] && now - alerted[item.id] < TWENTY_FOUR_H) continue;

      const currentPrice = await fetchCurrentPrice(item.sourceUrl);
      if (currentPrice === null) continue;

      const targetPrice = item.maxRecommendedBuy || item.inputPrice;
      if (!targetPrice) continue;

      // Alerta si el precio actual es <= al precio objetivo
      if (currentPrice <= targetPrice) {
        const notifyEmail = prefs.notifyEmail || email;
        const sent = await sendAlertEmail({
          to: notifyEmail,
          productName: item.name,
          currentPrice,
          targetPrice,
          productUrl: item.sourceUrl,
        });

        if (sent) {
          emailsSent++;
          alerted[item.id] = now;
          console.log(`[alerts-cron] Email enviado a ${notifyEmail} para "${item.name}" (${currentPrice}€ <= ${targetPrice}€)`);
        }
      }
    }

    // Guardar el registro de alertas enviadas
    if (Object.keys(alerted).length > 0) {
      await kvSet(alertedKey, alerted);
    }
  }

  console.log(`[alerts-cron] Fin. Revisados: ${checked} items. Emails enviados: ${emailsSent}`);
  return json(res, { ok: true, checked, emailsSent });
}
