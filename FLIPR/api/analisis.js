/**
 * Serverless Function de Vercel — Análisis público compartible & Open Graph.
 *
 * POST /api/analisis                  { result }  → guarda un análisis y devuelve { id }.
 * GET  /api/analisis?id=xxx           → devuelve el JSON del análisis guardado.
 * GET  /api/analisis?format=og&id=xxx → devuelve la imagen Open Graph dinámica en SVG (1200x630).
 * GET  /api/analisis?format=html&id=xxx (o /a/:id) → devuelve el HTML con Open Graph tags para redes.
 */

import { json, readBody, originOf } from '../lib/http.js';
import { kvGet, kvSet } from '../lib/kv.js';
import { checkRateLimit, getClientIp } from '../lib/rateLimit.js';
import { randomUUID } from 'node:crypto';

const FIELDS = [
  'id', 'name', 'verdict', 'flipScore', 'inputPrice', 'condition', 'marketplace',
  'imageUrl', 'marketDataSource', 'marketRangeMin', 'marketRangeMax',
  'probableResellMin', 'probableResellMax', 'maxRecommendedBuy',
  'estimatedProfitMin', 'estimatedProfitMax', 'targetOfferMin',
  'profitAtTargetMin', 'profitAtTargetMax', 'marginMin', 'marginMax',
  'demand', 'risk', 'liquidity',
  'timeToSell', 'createdAt',
];

export function sanitize(result) {
  if (!result || typeof result !== 'object') return null;
  const clean = {};
  for (const f of FIELDS) {
    if (result[f] !== undefined) clean[f] = result[f];
  }
  for (const arr of ['accessories', 'reasons']) {
    if (Array.isArray(result[arr])) {
      clean[arr] = result[arr].slice(0, 10).map((x) => String(x).slice(0, 120));
    }
  }
  if (Array.isArray(result.factors)) {
    clean.factors = result.factors.slice(0, 8).map((f) => {
      const o = {};
      for (const k of ['id', 'label', 'score', 'weight', 'hint']) {
        if (f && f[k] !== undefined) o[k] = f[k];
      }
      return o;
    });
  }
  if (!clean.name) clean.name = 'Producto de segunda mano';
  return clean;
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderOgSvg({ title, score, verdict, price, profit, marketplace }) {
  const isBuy = verdict === 'COMPRALO';
  const isNegotiate = verdict === 'NEGOCIA';
  const verdictLabel = isBuy ? 'CÓMPRALO' : isNegotiate ? 'NEGOCIA' : 'PASA';
  const themeColor = isBuy ? '#10B981' : isNegotiate ? '#F59E0B' : '#EF4444';
  const themeColorGlow = isBuy ? '#34D399' : isNegotiate ? '#FBBF24' : '#F87171';

  const cleanTitle = escapeXml(title.length > 55 ? title.slice(0, 52) + '...' : title);
  const cleanScore = escapeXml(score);
  const cleanPrice = escapeXml(price || 'Consultar');
  const cleanProfit = escapeXml(profit || 'Margen evaluado');
  const cleanMarketplace = escapeXml(marketplace);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090A0F"/>
      <stop offset="50%" stop-color="#12151F"/>
      <stop offset="100%" stop-color="#090A0F"/>
    </linearGradient>
    <linearGradient id="verdictGrad" x1="0" y1="0" x2="300" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${themeColorGlow}"/>
      <stop offset="100%" stop-color="${themeColor}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40" result="blur"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <circle cx="1050" cy="150" r="180" fill="${themeColor}" filter="url(#glow)" opacity="0.15"/>
  <circle cx="150" cy="550" r="220" fill="#3B82F6" filter="url(#glow)" opacity="0.10"/>
  <path d="M 0 100 L 1200 100 M 0 530 L 1200 530" stroke="#262A36" stroke-width="1" opacity="0.4"/>

  <g transform="translate(80, 50)">
    <rect width="48" height="48" rx="14" fill="#34D399"/>
    <path d="M26 12L18 26H26L22 36L32 22H24L26 12Z" fill="#090A0F"/>
    <text x="64" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="1">FLIPR</text>
    <text x="180" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#34D399" letter-spacing="2">· VALORACIÓN DE SEGUNDA MANO</text>
    <text x="1040" y="33" font-family="monospace" font-size="14" font-weight="600" fill="#6B7280" text-anchor="end">${cleanMarketplace.toUpperCase()}</text>
  </g>

  <text x="80" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF">
    ${cleanTitle}
  </text>

  <rect x="80" y="210" width="1040" height="280" rx="28" fill="#12151F" stroke="#262A36" stroke-width="2"/>
  <rect x="80" y="210" width="1040" height="280" rx="28" fill="${themeColor}" opacity="0.04"/>

  <g transform="translate(130, 260)">
    <text x="0" y="0" font-family="monospace" font-size="14" font-weight="700" fill="#9CA3AF" letter-spacing="2">VEREDICTO FLIPR</text>
    <rect x="0" y="18" width="380" height="84" rx="20" fill="url(#verdictGrad)"/>
    <text x="190" y="72" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="900" fill="#090A0F" text-anchor="middle" letter-spacing="1">■ ${verdictLabel}</text>
    <text x="0" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#D1D5DB" font-weight="500">
      ${isBuy ? 'Oportunidad rentable con margen sólido.' : isNegotiate ? 'Pide rebaja para asegurar margen de ganancia.' : 'Riesgo alto o precio por encima de mercado.'}
    </text>
  </g>

  <line x1="560" y1="250" x2="560" y2="450" stroke="#262A36" stroke-width="2"/>

  <g transform="translate(610, 260)">
    <g>
      <text x="0" y="0" font-family="monospace" font-size="14" font-weight="700" fill="#9CA3AF" letter-spacing="2">FLIP SCORE</text>
      <text x="0" y="65" font-family="monospace" font-size="70" font-weight="900" fill="${themeColorGlow}">${cleanScore}</text>
      <text x="120" y="60" font-family="monospace" font-size="28" font-weight="700" fill="#6B7280">/100</text>
    </g>

    <g transform="translate(230, 10)">
      <rect x="0" y="0" width="220" height="58" rx="14" fill="#090A0F" stroke="#262A36" stroke-width="1.5"/>
      <text x="16" y="22" font-family="monospace" font-size="10" fill="#9CA3AF" font-weight="700">PRECIO ANUNCIO</text>
      <text x="16" y="44" font-family="monospace" font-size="20" font-weight="800" fill="#FFFFFF">${cleanPrice}</text>

      <rect x="0" y="68" width="220" height="58" rx="14" fill="#090A0F" stroke="#262A36" stroke-width="1.5"/>
      <text x="16" y="90" font-family="monospace" font-size="10" fill="#9CA3AF" font-weight="700">MARGEN ESTIMADO</text>
      <text x="16" y="112" font-family="monospace" font-size="18" font-weight="800" fill="${themeColorGlow}">${cleanProfit}</text>
    </g>
  </g>

  <g transform="translate(80, 565)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">
      ¿Lo compro o no? Analiza cualquier producto en segundos en <tspan fill="#34D399">fliprscore.com</tspan>
    </text>
    <text x="1040" y="0" font-family="monospace" font-size="13" font-weight="600" fill="#6B7280" text-anchor="end">
      Wallapop · Vinted · Milanuncios · FB Marketplace
    </text>
  </g>
</svg>`;
}

function renderHtmlPreview({ id, title, score, verdict, price, profit, host }) {
  const verdictEmoji = verdict === 'COMPRALO' ? '🟢' : verdict === 'NEGOCIA' ? '🟡' : '🔴';
  const ogTitle = `${verdictEmoji} ${title} — Veredicto ${verdict} (${score}/100)`;
  const ogDesc = `Veredicto FLIPR: ${verdict} con ${score}/100 puntos FLIP SCORE. ${price ? `Precio: ${price}. ` : ''}${profit ? `Margen: ${profit}. ` : ''}Mira la valoración completa y mensaje de negociación en FLIPR.`;
  const ogImage = `${host}/api/og?id=${encodeURIComponent(id)}`;
  const canonicalUrl = `${host}/a/${encodeURIComponent(id)}`;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(ogTitle)} — FLIPR</title>
  <meta name="description" content="${escapeHtml(ogDesc)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDesc)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="FLIPR" />
  <meta property="og:locale" content="es_ES" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet" />

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #090A0F;
      color: #e5e7eb;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: #12151F;
      border: 1px solid #262a36;
      border-radius: 24px;
      padding: 32px 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      font-family: 'JetBrains Mono', monospace;
      ${verdict === 'COMPRALO' ? 'background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);' : verdict === 'NEGOCIA' ? 'background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);' : 'background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);'}
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .score-circle {
      font-size: 48px;
      font-weight: 900;
      font-family: 'JetBrains Mono', monospace;
      color: #34d399;
      margin: 16px 0 8px;
    }
    .desc {
      color: #9ca3af;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: linear-gradient(135deg, #10b981, #34d399);
      color: #000;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 20px;
      border-radius: 14px;
      text-decoration: none;
    }
    .logo {
      margin-bottom: 20px;
      font-weight: 900;
      letter-spacing: 0.1em;
      color: #34d399;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ FLIPR</div>
    <div class="badge">VEREDICTO: ${escapeHtml(verdict)}</div>
    <h1>${escapeHtml(title)}</h1>
    <div class="score-circle">${escapeHtml(score)}<span style="font-size: 20px; color: #6b7280;">/100</span></div>
    <p class="desc">${escapeHtml(ogDesc)}</p>
    <a href="/?view_analysis=${encodeURIComponent(id)}" class="btn">Abrir análisis interactivo completo</a>
  </div>

  <script>
    (function() {
      try {
        if (!navigator.userAgent.match(/bot|crawl|spider|facebook|whatsapp|telegram|twitter|slack|discord|pinterest|linkedin/i)) {
          window.location.replace('/?view_analysis=${encodeURIComponent(id)}');
        }
      } catch(_) {}
    })();
  </script>
</body>
</html>`;
}

export default async function handler(req, res) {
  const ip = getClientIp(req);
  const isWrite = req.method === 'POST';
  const format = String(req.query?.format || (req.query?.og ? 'og' : '')).toLowerCase();

  // ── FORMAT: OG IMAGE (SVG) ────────────────────────────────────────────────
  if (format === 'og') {
    let title = 'Análisis de Segunda Mano';
    let score = '80';
    let verdict = 'COMPRALO';
    let price = '';
    let profit = '';
    let marketplace = 'Wallapop';

    const id = req.query?.id ? String(req.query.id).trim() : '';
    if (id) {
      try {
        const data = await kvGet(`analysis:${id}`);
        if (data && typeof data === 'object') {
          title = data.name || title;
          score = String(data.flipScore || score);
          verdict = String(data.verdict || verdict).toUpperCase();
          if (data.inputPrice) price = `${data.inputPrice}€`;
          if (data.estimatedProfitMin !== undefined) {
            profit = `${data.estimatedProfitMin}€ a ${data.estimatedProfitMax}€`;
          }
          if (data.marketplace) marketplace = data.marketplace;
        }
      } catch (_) {}
    } else {
      if (req.query?.title) title = String(req.query.title);
      if (req.query?.score) score = String(req.query.score);
      if (req.query?.verdict) verdict = String(req.query.verdict).toUpperCase();
      if (req.query?.price) price = `${String(req.query.price).replace(/€/g, '')}€`;
      if (req.query?.profit) profit = String(req.query.profit);
    }

    const svg = renderOgSvg({ title, score, verdict, price, profit, marketplace });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    return res.end(svg);
  }

  // ── FORMAT: HTML OPEN GRAPH PREVIEW (FOR SOCIAL CRAWLERS) ────────────────
  if (format === 'html') {
    const id = String(req.query?.id || '').trim().slice(0, 80);
    const host = originOf(req) || 'https://www.fliprscore.com';

    let title = 'Análisis de oportunidad';
    let score = 80;
    let verdict = 'COMPRALO';
    let price = '';
    let profit = '';
    let marketplace = 'Wallapop';

    if (id) {
      try {
        const data = await kvGet(`analysis:${id}`);
        if (data && typeof data === 'object') {
          title = data.name || title;
          score = data.flipScore || score;
          verdict = String(data.verdict || verdict).toUpperCase();
          if (data.inputPrice) price = `${data.inputPrice}€`;
          if (data.estimatedProfitMin !== undefined) {
            profit = `${data.estimatedProfitMin}€ a ${data.estimatedProfitMax}€`;
          }
          if (data.marketplace) marketplace = data.marketplace;
        }
      } catch (_) {}
    }

    const html = renderHtmlPreview({ id, title, score, verdict, price, profit, host });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    return res.end(html);
  }

  // Rate limit para API JSON
  const rl = await checkRateLimit(`pub:${ip}`, {
    maxRequests: isWrite ? 30 : 120,
    windowSecs: 3600,
  });
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.resetIn));
    return json(res, { ok: false, reason: 'rate-limited', resetIn: rl.resetIn }, 429);
  }

  try {
    if (req.method === 'POST') {
      const body = await readBody(req);
      const result = sanitize(body && body.result);
      if (!result) return json(res, { ok: false, reason: 'invalid-result' }, 400);

      if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
        return json(res, { ok: false, reason: 'no-db' }, 503);
      }

      const id = randomUUID();
      result.id = id;
      result.createdAt = result.createdAt || Date.now();
      const saved = await kvSet(`analysis:${id}`, result);
      if (!saved) return json(res, { ok: false, reason: 'db-error' }, 500);
      return json(res, { ok: true, id });
    }

    if (req.method === 'GET') {
      const id = String(req.query?.id || '').trim().slice(0, 80);
      if (!id) return json(res, { ok: false, reason: 'missing-id' }, 400);
      const result = await kvGet(`analysis:${id}`);
      if (!result || typeof result !== 'object') return json(res, { ok: false, reason: 'not-found' }, 404);
      return json(res, { ok: true, result });
    }

    return json(res, { ok: false, reason: 'method-not-allowed' }, 405);
  } catch (e) {
    console.log('analisis error', e && e.message);
    return json(res, { ok: false, reason: 'error' }, 500);
  }
}
