/**
 * Utilidades para compartir análisis en redes sociales y mensajería.
 */

/**
 * Guarda un análisis en el servidor (Vercel KV) vía /api/analisis y devuelve
 * la URL pública /a/:id. Si falla o no hay servidor, devuelve una URL de fallback.
 */
export async function createShareLink(result) {
  if (!result) return window.location.origin;

  // Si ya tiene un ID guardado público
  if (result.id && typeof result.id === 'string' && result.id.length > 10 && !result.id.startsWith('preset-')) {
    return `${window.location.origin}/a/${result.id}`;
  }

  try {
    const resp = await fetch('/api/analisis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    });
    const data = await resp.json().catch(() => null);
    if (data && data.ok && data.id) {
      return `${window.location.origin}/a/${data.id}`;
    }
  } catch (_) {}

  // Fallback con hash o URL base
  return window.location.origin;
}

/**
 * Formatea un texto resumen con emojis y métricas clave listo para compartir.
 */
export function formatShareSummary(result, url = '') {
  if (!result) return '';
  const name = result.name || 'Producto';
  const score = result.flipScore || 0;
  const verdict = result.verdict || 'ANALIZADO';
  const price = result.inputPrice ? `${result.inputPrice}€` : 'N/D';
  const profit = result.estimatedProfitMin !== undefined
    ? `${result.estimatedProfitMin}€ a ${result.estimatedProfitMax}€`
    : null;

  const verdictEmoji = verdict === 'COMPRALO' ? '🟢' : verdict === 'NEGOCIA' ? '🟡' : '🔴';

  const lines = [
    `⚡ Análisis de oportunidad en FLIPR:`,
    `📦 ${name}`,
    `${verdictEmoji} Veredicto: ${verdict} (FLIP SCORE: ${score}/100)`,
    `💰 Precio analizado: ${price}`,
  ];

  if (profit) {
    lines.push(`📈 Margen estimado: ${profit}`);
  }

  if (result.maxRecommendedBuy) {
    lines.push(`🎯 Precio máx recomendado: ${result.maxRecommendedBuy}€`);
  }

  if (url) {
    lines.push(``, `👉 Ver análisis completo: ${url}`);
  }

  return lines.join('\n');
}

/**
 * Genera el texto optimizado para Twitter / X (máx 280 caracteres).
 */
export function formatTweetText(result, url = '') {
  if (!result) return '';
  const verdictEmoji = result.verdict === 'COMPRALO' ? '🟢' : result.verdict === 'NEGOCIA' ? '🟡' : '🔴';
  const name = (result.name || 'este producto').slice(0, 45);
  const score = result.flipScore || 0;
  return `${verdictEmoji} He analizado "${name}" con @FLIPRScore: Veredicto ${result.verdict} (${score}/100). ¿Vale la pena comprarlo? ⬇️\n${url}`;
}

/**
 * Genera el enlace directo para compartir en WhatsApp.
 */
export function getWhatsAppShareUrl(text) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Genera el enlace directo para compartir en Telegram.
 */
export function getTelegramShareUrl(url, text) {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/**
 * Genera el enlace directo para compartir en Twitter / X.
 */
export function getTwitterShareUrl(text, url) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ''}`;
}
