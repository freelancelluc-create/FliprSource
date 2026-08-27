/**
 * Motor de valoración FLIPR
 * Calcula margen, beneficio neto estimado, recomendación inequívoca y FLIP SCORE™ 0-100.
 *
 * FLIP SCORE™ = media ponderada de 5 factores (0-100 cada uno):
 *   Precio (30%) · Margen (30%) · Demanda (15%) · Riesgo (15%) · Velocidad (10%)
 *
 * Si se pasa `marketData` (de MARKET_CATALOG) se usa el valor de mercado REAL del
 * producto para comparar con el precio de compra. Si no, se cae a una heurística
 * basada en el precio (marcada como estimación).
 */

const DEMANDA_SCORE = { "MUY ALTA": 95, "ALTA": 80, "MEDIA": 55, "BAJA": 30 };
const RIESGO_SCORE = { "BAJO": 85, "MEDIO": 55, "ALTO": 25 };
const VELOCIDAD_SCORE = { "FÁCIL": 80, "MEDIA": 60, "DIFÍCIL": 35 };

const WEIGHTS = {
  precio: 30,
  margen: 30,
  demanda: 15,
  riesgo: 15,
  velocidad: 10,
};

/**
 * Calcula los 5 factores del FLIP SCORE a partir de los datos del análisis.
 * Cada factor puntúa 0-100 (más alto = mejor para el flipeo).
 */
export function computeFlipFactors({ price, marketAvg, marginMin, marginMax, demand, risk, liquidity }) {
  const safePrice = parseFloat(price) || 0;
  const safeMarket = parseFloat(marketAvg) || 0;
  const discountRatio = safeMarket > 0 ? (safeMarket - safePrice) / safeMarket : 0;
  const avgMargin = ((parseFloat(marginMin) || 0) + (parseFloat(marginMax) || 0)) / 2;

  const clamp = (n) => Math.min(100, Math.max(0, Math.round(n)));

  const factors = [
    {
      id: "precio",
      label: "Precio",
      score: clamp(discountRatio * 270),
      weight: WEIGHTS.precio,
      hint: "Precio de compra frente al valor de mercado (más barato que el mercado = mejor).",
    },
    {
      id: "margen",
      label: "Margen",
      score: clamp(avgMargin * 2.5),
      weight: WEIGHTS.margen,
      hint: "Beneficio neto estimado sobre el precio de compra, tras comisiones.",
    },
    {
      id: "demanda",
      label: "Demanda",
      score: DEMANDA_SCORE[demand] ?? 55,
      weight: WEIGHTS.demanda,
      hint: "Interés de los compradores en este tipo de producto.",
    },
    {
      id: "riesgo",
      label: "Riesgo",
      score: RIESGO_SCORE[risk] ?? 55,
      weight: WEIGHTS.riesgo,
      hint: "A menor riesgo (réplicas, averías, depreciación), mejor puntuación.",
    },
    {
      id: "velocidad",
      label: "Velocidad",
      score: VELOCIDAD_SCORE[liquidity] ?? 55,
      weight: WEIGHTS.velocidad,
      hint: "Facilidad y rapidez estimada para revender el producto.",
    },
  ];

  const weightedScore = Math.round(
    factors.reduce((acc, f) => acc + f.score * f.weight, 0) / 100
  );

  return { factors, weightedScore };
}

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

  // Valor de mercado y rangos: datos reales si reconocemos el producto
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
  const marginMin = Math.min(999, Math.round((estimatedProfitMin / price) * 100));
  const marginMax = Math.min(999, Math.round((estimatedProfitMax / price) * 100));

  // Precio máximo de compra recomendado para mantener un 20% de margen
  const maxRecommendedBuy = Math.round((avgResell - shippingFee) / 1.25);

  // Beneficio potencial si se compra al precio objetivo (clave para el "flipper")
  const costAtTarget = maxRecommendedBuy + platformFee + shippingFee;
  const profitAtTargetMin = Math.max(0, Math.round(probableResellMin - costAtTarget));
  const profitAtTargetMax = Math.max(0, Math.round(probableResellMax - costAtTarget));
  const targetOfferMin = Math.max(1, Math.round(maxRecommendedBuy * 0.9));

  // FLIP SCORE™ = media ponderada de los 5 factores
  const { factors, weightedScore } = computeFlipFactors({
    price,
    marketAvg: estimatedMarketAvg,
    marginMin,
    marginMax,
    demand,
    risk,
    liquidity,
  });
  const flipScore = Math.min(99, Math.max(12, weightedScore));

  // Determinación de Veredicto inequívoco
  let verdict = "COMPRALO";
  if (flipScore < 60 || avgProfit < 20) {
    verdict = "PASA";
  } else if (flipScore < 68) {
    verdict = "NEGOCIA";
  }

  // Ajustar indicadores cualitativos solo cuando NO usamos datos de catálogo
  if (!usingMarketData) {
    if (flipScore < 60) {
      demand = "MEDIA"; risk = "ALTO"; liquidity = "DIFÍCIL"; timeToSell = "10–20 días";
    } else if (flipScore < 68) {
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
    profitAtTargetMin,
    profitAtTargetMax,
    targetOfferMin,
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
    factors,
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
