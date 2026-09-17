/**
 * Serverless Function de Vercel — Búsqueda de datos de mercado (KV-backed)
 *
 * GET /api/catalog-lookup?q=<título o producto>
 *
 * Devuelve el objeto de catálogo completo (marketAvg, rangos de reventa,
 * demanda, riesgo, liquidez, tiempo de venta...) que necesita el motor de
 * cálculo del cliente (src/utils/flipCalculator.js), o { found:false } si
 * no hay ningún producto que coincida.
 *
 * A diferencia de api/market-price.js (pensado para el widget resumido de
 * las landing pages), este endpoint alimenta el flujo principal de
 * análisis y es la pieza que permite que el catálogo se amplíe en KV sin
 * redeploy — ver lib/catalog.js.
 *
 * Nunca devuelve un error duro: si KV falla, respondemos found:false y el
 * cliente cae a su catálogo local de respaldo (src/utils/catalogApi.js).
 */

import { getCatalog, findInCatalog } from '../lib/catalog.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, reason: 'method-not-allowed' });
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const q = String(url.searchParams.get('q') || '').trim().slice(0, 150);

  // Cache corto en el edge: el catálogo puede cambiar (KV), así que no
  // usamos las 24h de caché del widget — 5 min es suficiente para no
  // golpear KV en cada tecla, sin servir datos desactualizados mucho tiempo.
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (!q) {
    res.status(200).json({ ok: true, found: false });
    return;
  }

  try {
    const catalog = await getCatalog();
    const match = findInCatalog(catalog, q);
    if (!match) {
      res.status(200).json({ ok: true, found: false, q });
      return;
    }
    res.status(200).json({ ok: true, found: true, q, product: match });
  } catch (e) {
    console.log('catalog-lookup error', e && e.message);
    res.status(200).json({ ok: true, found: false, q, error: 'lookup-failed' });
  }
}
