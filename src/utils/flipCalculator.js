/**
 * Motor de valoración FLIPR
 * Calcula margen, beneficio neto estimado, recomendación inequívoca y FLIP SCORE™ 0-100
 *
 * Si se pasa `marketData` (de MARKET_CATALOG) se usa el valor de mercado REAL del
 * producto para comparar con el precio de compra. Si no, se cae a una heurística
 * basada en el precio (marcada como estimación).
 */

export function calculateFlipScore({
  title,
  buyPrice,
  condition = "Muy buen estado",
  marketplace = "Wallapop",
  category = "Tecnología",
  accessories = [],
  marketData = null
}) {
  const price = parseFloat(buyPrice) || 100;

  // Factores de multiplicador según el estado del producto (solo heurística)
  const conditionMultipliers = {
    "Nuevo": 1.45,
    "Como nuevo": 1.38,
    "Muy buen estado": 1.32,
    "Buen estado": 1.22,
    "Aceptable": 1.12
  };
  const mult = conditionMultipliers[condition] || 1.30;

  // Valor de mercado y rangos: usamos datos reales si reconocemos el producto
  let estimatedMarketAvg, marketRangeMin, marketRangeMax;
  let probableResellMin, probableResellMax;
  let demand, risk, liquidity, timeToSell;
  let productCategory = category;
  const usingMarketData = !!(marketData && marketData.marketAvg);

  if (usingMarketData) {
    estimatedMarketAvg = marketData.marketAvg;
    marketRangeMin = marketData.marketRangeMin ?? Math.round(marketData.marketAvg * 0.93);
    marketRangeMax = marketData.marketRangeMax ?? Math.round(marketData.marketAvg * 1.07);
    probableResellMin = marketData.probableResellMin ?? Math.round(marketData.marketAvg * 0.96);
    probableResellMax = marketData.probableResellMax ?? Math.round(marketData.marketAvg * 1.04);
    demand = marketData.demand || "ALTA";
    risk = marketData.risk || "BAJO";
    liquidity = marketData.liquidity || "FÁCIL";
    timeToSell = marketData.timeToSell || "3–7 días";
    productCategory = marketData.category || category;
  } else {
    estimatedMarketAvg = Math.round(price * mult);
    marketRangeMin = Math.round(estimatedMarketAvg * 0.93);
    marketRangeMax = Math.round(estimatedMarketAvg * 1.07);
    probableResellMin = Math.round(estimatedMarketAvg * 0.96);
    probableResellMax = Math.round(estimatedMarketAvg * 1.04);
    demand = "ALTA";
    risk = "BAJO";
    liquidity = "FÁCIL";
    timeToSell = "3–7 días";
  }

  // Precio de venta probable
  const avgResell = (probableResellMin + probableResellMax) / 2;

  // Gastos estimados (comisiones de marketplace ~5%, gestión/envío ~4-8€)
  const platformFee = avgResell * 0.05;
  const shippingFee = 4.50;
  const totalCost = price + platformFee + shippingFee;

  // Beneficios netos
  const estimatedProfitMin = Math.max(0, Math.round(probableResellMin - totalCost));
  const estimatedProfitMax = Math.max(0, Math.round(probableResellMax - totalCost));
  const avgProfit = (estimatedProfitMin + estimatedProfitMax) / 2;

  // Margen % = (Beneficio / Precio compra) * 100 (acotado a 999 para mostrar cifras sanas)
  const rawMarginMin = Math.round((estimatedProfitMin / price) * 100);
  const rawMarginMax = Math.round((estimatedProfitMax / price) * 100);
  const marginMin = Math.min(999, rawMarginMin);
  const marginMax = Math.min(999, rawMarginMax);
  const avgMargin = (marginMin + marginMax) / 2;

  // Precio máximo de compra recomendado para mantener un 20% de margen
  const maxRecommendedBuy = Math.round((avgResell - shippingFee) / 1.25);

  // Algoritmo FLIP SCORE™ 0-100
  let rawScore = 0;

  // 1. Ratio precio compra vs mercado (50%)
  const discountRatio = (estimatedMarketAvg - price) / estimatedMarketAvg;
  rawScore += Math.min(50, Math.max(0, discountRatio * 200));

  // 2. Margen de beneficio (40%)
  rawScore += Math.min(40, Math.max(0, avgMargin * 1.4));

  // 3. Bonus por accesorios (caja, factura, extras) (10%)
  if (accessories && accessories.length > 0) {
    rawScore += Math.min(10, accessories.length * 3.5);
  }

  // Clamp entre 0 y 99 (100 reservado para chollos extremos)
  const flipScore = Math.min(99, Math.max(12, Math.round(rawScore)));

  // Determinación de Veredicto inequívoco
  let verdict = "COMPRALO";
  if (flipScore < 60 || avgProfit < 20) {
    verdict = "PASA";
  } else if (flipScore < 78 || avgMargin < 18) {
    verdict = "NEGOCIA";
  }

  // Ajustar indicadores cualitativos solo cuando NO usamos datos de catálogo
  if (!usingMarketData) {
    if (flipScore < 60) {
      demand = "MEDIA"; risk = "ALTO"; liquidity = "DIFÍCIL"; timeToSell = "10–20 días";
    } else if (flipScore < 80) {
      demand = "ALTA"; risk = "MEDIO"; liquidity = "FÁCIL"; timeToSell = "5–10 días";
    }
  }

  const confidence = Math.min(96, Math.max(84, 88 + Math.floor(Math.random() * 7)));
  const suggestedOffer = Math.round(price * 0.88);

  const marketRef = usingMarketData
    ? `valor medio de mercado real de ${estimatedMarketAvg} €`
    : `valor medio estimado de ${estimatedMarketAvg} € (estimación por estado)`;

  return {
    id: "custom-" + Date.now(),
    name: title || "Producto sin nombre",
    category: productCategory,
    inputPrice: price,
    condition,
    accessories,
    marketplace,
    verdict,
    flipScore,
    marketRangeMin,
    marketRangeMax,
    maxRecommendedBuy,
    probableResellMin,
    probableResellMax,
    estimatedProfitMin,
    estimatedProfitMax,
    marginMin,
    marginMax,
    demand,
    risk,
    liquidity,
    timeToSell,
    confidence,
    reasons: [
      `Precio de compra de ${price} € vs ${marketRef}.`,
      `Margen de beneficio proyectado del ${marginMin}% al ${marginMax}% tras comisiones de ${marketplace}.`,
      `El estado '${condition}' permite posicionar la venta en la franja razonable de ${probableResellMin}–${probableResellMax} €.`,
      `Tiempo de venta estimado de ${timeToSell} con riesgo ${risk.toLowerCase()}.`
    ],
    negotiationTip: `El precio objetivo máximo recomendado de compra es ${maxRecommendedBuy} €. Intenta conseguir una rebaja ofreciendo unos ${suggestedOffer} € en mano.`,
    negociarTemplate: `¡Hola! Me interesa ${title || 'el producto'}. ¿Habría posibilidad de dejarlo en ${suggestedOffer} € si voy a buscarlo hoy mismo?`,
    listingTitle: `${title || 'Producto'} - Excelente estado (${condition}) + Envío Rápido`,
    listingDescription: `En venta ${title || 'producto'} en estado ${condition.toLowerCase()}.

- Probado y 100% funcional.
- Se entrega bien empaquetado y limpio.
- Acepto envío o trato en mano.`,
    tags: [(title || 'segundamano').toLowerCase().replace(/\s+/g, ''), marketplace.toLowerCase(), "reventa"],
    usedMarketData: usingMarketData
  };
}
