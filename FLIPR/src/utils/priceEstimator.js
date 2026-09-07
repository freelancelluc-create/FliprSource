/**
 * Estimador de valor de reventa — calculadora gratuita (lead magnet §9).
 *
 * Dado un nombre de producto, estado y precio de compra opcional, devuelve un
 * rango estimado de reventa. Si reconoce el producto en el catálogo usa datos
 * reales; si no, hace una estimación heurística a partir del precio.
 *
 * Es una función pura: no consume créditos, no toca el servidor, y es el
 * "gancho" gratuito que lleva a analizar el producto completo con FLIPR.
 */

import { findMarketData } from '../data/marketCatalog.js';

// Coherente con flipCalculator.js (mismos multiplicadores por estado).
const CONDITION_MULT = {
  'Nuevo': 1.45,
  'Como nuevo': 1.38,
  'Muy buen estado': 1.32,
  'Buen estado': 1.22,
  'Aceptable': 1.12,
  'A reparar': 1.0,
};

// Factor de ajuste respecto al estado base del catálogo ("Muy buen estado" = 1.32).
function conditionFactor(condition) {
  return (CONDITION_MULT[condition] || CONDITION_MULT['Muy buen estado']) / CONDITION_MULT['Muy buen estado'];
}

/**
 * @param {object} args
 * @param {string} args.productName  Nombre o modelo del producto.
 * @param {string} [args.condition]  Estado (ver CONDITION_MULT).
 * @param {number|string} [args.purchasePrice]  Precio de compra (opcional).
 * @returns {{found:boolean, productName:string, min:number|null, max:number|null,
 *            marketAvg:number|null, purchasePrice:number,
 *            estimatedProfitMin:number|null, estimatedProfitMax:number|null, note:string}}
 */
export function estimateResale({ productName = '', condition = 'Muy buen estado', purchasePrice = 0 } = {}) {
  const price = Number(purchasePrice) || 0;
  const factor = conditionFactor(condition);

  const marketData = findMarketData(productName);
  if (marketData && marketData.probableResellMin) {
    const min = Math.max(0, Math.round(marketData.probableResellMin * factor));
    const max = Math.round(marketData.probableResellMax * factor);
    return {
      found: true,
      productName: marketData.name,
      min,
      max,
      marketAvg: marketData.marketAvg,
      purchasePrice: price,
      estimatedProfitMin: price > 0 ? Math.max(0, min - price) : null,
      estimatedProfitMax: price > 0 ? Math.max(0, max - price) : null,
      note: 'Rango estimado a partir de los datos de mercado de FLIPR.',
    };
  }

  // Sin datos de catálogo: heurística a partir del precio introducido.
  if (price > 0) {
    const avg = Math.round(price * CONDITION_MULT[condition] || CONDITION_MULT['Muy buen estado']);
    const min = Math.max(0, Math.round(avg * 0.94));
    const max = Math.round(avg * 1.06);
    return {
      found: false,
      productName,
      min,
      max,
      marketAvg: avg,
      purchasePrice: price,
      estimatedProfitMin: Math.max(0, min - price),
      estimatedProfitMax: Math.max(0, max - price),
      note: 'Estimación orientativa: no hemos encontrado datos exactos para este producto.',
    };
  }

  return {
    found: false,
    productName,
    min: null,
    max: null,
    marketAvg: null,
    purchasePrice: 0,
    estimatedProfitMin: null,
    estimatedProfitMax: null,
    note: 'Introduce un producto o un precio para obtener una estimación.',
  };
}
