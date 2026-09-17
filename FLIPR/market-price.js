/**
 * Serverless Function de Vercel — Precios de mercado para el widget de landing
 *
 * GET /api/market-price?q=<keyword>
 *
 * Busca en el catálogo de FLIPR (ver lib/catalog.js — KV con SEED_CATALOG
 * como red de seguridad) el producto que mejor coincide con la keyword
 * recibida y devuelve los datos resumidos que consume el widget de las
 * landing pages.
 *
 * Antes este archivo tenía su PROPIA copia del catálogo, duplicada respecto
 * a src/data/marketCatalog.js — las dos podían desincronizarse si se
 * actualizaba una y no la otra. Desde la Fase 1 de la migración a KV, este
 * endpoint y api/catalog-lookup.js (usado por el flujo principal de
 * análisis) leen del mismo sitio: lib/catalog.js.
 */

import { getCatalog, findInCatalog } from '../lib/catalog.js';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, reason: "method-not-allowed" });
    return;
  }

  const url = new URL(req.url || "/", "http://localhost");
  const q = String(url.searchParams.get("q") || "").trim().slice(0, 100);

  if (!q) {
    res.status(400).json({ ok: false, reason: "missing-q" });
    return;
  }

  // Cache de 5 min en el borde de Vercel: el catálogo ahora puede cambiar
  // en KV sin redeploy, así que ya no usamos las 24h de antes.
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  let product = null;
  try {
    const catalog = await getCatalog();
    product = findInCatalog(catalog, q);
  } catch (e) {
    console.log("market-price: fallo leyendo catálogo", e && e.message);
  }

  if (!product) {
    res.status(200).json({ ok: false, reason: "not-found", q });
    return;
  }

  const avg = product.marketAvg;
  const low = product.marketRangeMin;
  const high = product.marketRangeMax;
  const median = Math.round((low + high) / 2);
  const maxBuy = Math.round(median * 0.94);

  res.status(200).json({
    ok: true,
    q,
    productId: product.id,
    avg,
    median,
    low,
    high,
    maxBuy,
    demand: product.demand,
    timeToSell: product.timeToSell,
    source: "flipr-catalog",
    updatedAt: new Date().toISOString(),
  });
}
