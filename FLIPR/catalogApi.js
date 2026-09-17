/**
 * Cliente para /api/catalog-lookup — obtiene datos de mercado desde el
 * catálogo dinámico (KV, ver lib/catalog.js) en vez del catálogo estático
 * embebido en el bundle.
 *
 * Si la llamada falla por cualquier motivo (red, timeout, servidor caído),
 * cae al catálogo local (`findMarketData`, el mismo que usaba el flujo
 * antes de la Fase 1) para que el análisis nunca se rompa por un problema
 * de conectividad o de KV.
 */

import { findMarketData as findMarketDataLocal } from '../data/marketCatalog.js';

const TIMEOUT_MS = 4000;

/**
 * @param {string} title Título o nombre del producto a buscar.
 * @returns {Promise<object|null>} El objeto de catálogo (marketAvg, rangos,
 *   demanda, riesgo, liquidez, tiempo de venta...) o null si no hay match.
 */
export async function fetchMarketData(title) {
  if (!title) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let resp;
    try {
      resp = await fetch(`/api/catalog-lookup?q=${encodeURIComponent(title)}`, {
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!resp.ok) throw new Error('catalog-lookup status ' + resp.status);

    const data = await resp.json();
    if (data && data.found && data.product) return data.product;
    return null;
  } catch (e) {
    console.warn('catalog-lookup falló, usando catálogo local de respaldo:', e && e.message);
    return findMarketDataLocal(title);
  }
}
