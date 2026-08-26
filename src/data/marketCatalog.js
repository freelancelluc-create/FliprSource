/**
 * Catálogo de mercado FLIPR
 * Datos de mercado (valor medio, rango de reventa, demanda…) por producto.
 * Se usan cuando reconocemos el producto por su título/palabras clave, en lugar
 * de derivar el valor de mercado del precio de compra (que era incorrecto).
 */

export const MARKET_CATALOG = [
  {
    id: "rieju-mrx-pro",
    name: "Rieju MRX Pro / MRX Supermotard",
    category: "Motocicletas",
    keywords: ["rieju", "mrx pro", "mrx", "supermotard"],
    marketAvg: 1250,
    marketRangeMin: 1050,
    marketRangeMax: 1450,
    probableResellMin: 1150,
    probableResellMax: 1350,
    demand: "MEDIA",
    risk: "MEDIO",
    liquidity: "MEDIA",
    timeToSell: "15–30 días"
  },
  {
    id: "ps5-slim",
    name: "PlayStation 5 Slim / PS5",
    category: "Consolas",
    keywords: ["ps5", "playstation 5", "playstation5"],
    marketAvg: 350,
    marketRangeMin: 330,
    marketRangeMax: 370,
    probableResellMin: 340,
    probableResellMax: 360,
    demand: "ALTA",
    risk: "BAJO",
    liquidity: "FÁCIL",
    timeToSell: "3–7 días"
  },
  {
    id: "iphone-14-pro",
    name: "iPhone 14 Pro",
    category: "Smartphones",
    keywords: ["iphone 14"],
    marketAvg: 700,
    marketRangeMin: 680,
    marketRangeMax: 740,
    probableResellMin: 700,
    probableResellMax: 720,
    demand: "MUY ALTA",
    risk: "BAJO",
    liquidity: "FÁCIL",
    timeToSell: "2–5 días"
  },
  {
    id: "iphone-13",
    name: "iPhone 13",
    category: "Smartphones",
    keywords: ["iphone 13"],
    marketAvg: 430,
    marketRangeMin: 410,
    marketRangeMax: 450,
    probableResellMin: 420,
    probableResellMax: 440,
    demand: "ALTA",
    risk: "BAJO",
    liquidity: "FÁCIL",
    timeToSell: "3–6 días"
  },
  {
    id: "switch-oled",
    name: "Nintendo Switch OLED",
    category: "Consolas",
    keywords: ["switch", "nintendo"],
    marketAvg: 245,
    marketRangeMin: 230,
    marketRangeMax: 260,
    probableResellMin: 240,
    probableResellMax: 255,
    demand: "ALTA",
    risk: "MEDIO",
    liquidity: "FÁCIL",
    timeToSell: "5–10 días"
  },
  {
    id: "macbook-air-m1",
    name: "MacBook Air M1",
    category: "Ordenadores",
    keywords: ["macbook", "macbook air", "m1"],
    marketAvg: 645,
    marketRangeMin: 620,
    marketRangeMax: 670,
    probableResellMin: 630,
    probableResellMax: 655,
    demand: "ALTA",
    risk: "BAJO",
    liquidity: "MEDIA",
    timeToSell: "4–8 días"
  },
  {
    id: "airpods-pro",
    name: "AirPods Pro",
    category: "Audio",
    keywords: ["airpods", "airpods pro"],
    marketAvg: 170,
    marketRangeMin: 160,
    marketRangeMax: 180,
    probableResellMin: 165,
    probableResellMax: 175,
    demand: "ALTA",
    risk: "ALTO",
    liquidity: "DIFÍCIL",
    timeToSell: "7–14 días"
  },
  {
    id: "rtx-3070",
    name: "Tarjeta Gráfica RTX 3070",
    category: "Componentes PC",
    keywords: ["rtx 3070", "rtx3070", "rtx", "grafica", "gpu"],
    marketAvg: 330,
    marketRangeMin: 310,
    marketRangeMax: 350,
    probableResellMin: 320,
    probableResellMax: 340,
    demand: "MEDIA",
    risk: "MEDIO",
    liquidity: "FÁCIL",
    timeToSell: "3–7 días"
  }
];

/**
 * Busca en el catálogo un producto que coincida con el título indicado.
 * Devuelve el objeto de catálogo completo o null si no se reconoce.
 * Se prioriza la coincidencia más específica (palabra clave más larga).
 */
export function findMarketData(title) {
  if (!title) return null;
  const lower = title.toLowerCase();
  let best = null;
  let bestLen = 0;
  for (const entry of MARKET_CATALOG) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw) && kw.length > bestLen) {
        best = entry;
        bestLen = kw.length;
      }
    }
  }
  return best;
}
