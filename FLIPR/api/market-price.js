/**
 * Serverless Function de Vercel — Precios de mercado desde el catálogo FLIPR
 *
 * GET /api/market-price?q=<keyword>
 *
 * Busca en el catálogo estático de FLIPR el producto que mejor coincide
 * con la keyword recibida y devuelve los datos de mercado formateados
 * para que el widget de las landing pages los consuma.
 *
 * Cache: 24 horas en Vercel Edge (los datos del catálogo no cambian en tiempo real).
 */

// Catálogo inline (mismos datos que src/data/marketCatalog.js, sin imports ES module)
const MARKET_CATALOG = [
  {
    id: "ps5-slim",
    keywords: ["ps5", "playstation 5", "playstation5"],
    marketAvg: 350, marketRangeMin: 330, marketRangeMax: 370,
    probableResellMin: 340, probableResellMax: 360,
    demand: "ALTA", timeToSell: "3–7 días"
  },
  {
    id: "iphone-14-pro",
    keywords: ["iphone 14 pro"],
    marketAvg: 700, marketRangeMin: 680, marketRangeMax: 740,
    probableResellMin: 700, probableResellMax: 720,
    demand: "MUY ALTA", timeToSell: "2–5 días"
  },
  {
    id: "iphone-14",
    keywords: ["iphone 14"],
    marketAvg: 580, marketRangeMin: 530, marketRangeMax: 640,
    probableResellMin: 555, probableResellMax: 610,
    demand: "MUY ALTA", timeToSell: "2–5 días"
  },
  {
    id: "iphone-13",
    keywords: ["iphone 13"],
    marketAvg: 430, marketRangeMin: 410, marketRangeMax: 450,
    probableResellMin: 420, probableResellMax: 440,
    demand: "ALTA", timeToSell: "3–6 días"
  },
  {
    id: "iphone-12",
    keywords: ["iphone 12"],
    marketAvg: 350, marketRangeMin: 330, marketRangeMax: 380,
    probableResellMin: 345, probableResellMax: 365,
    demand: "MUY ALTA", timeToSell: "2–5 días"
  },
  {
    id: "iphone",
    keywords: ["iphone segunda mano", "iphone"],
    marketAvg: 490, marketRangeMin: 330, marketRangeMax: 740,
    probableResellMin: 400, probableResellMax: 650,
    demand: "MUY ALTA", timeToSell: "2–5 días"
  },
  {
    id: "macbook-air-m2",
    keywords: ["macbook air m2"],
    marketAvg: 880, marketRangeMin: 840, marketRangeMax: 940,
    probableResellMin: 860, probableResellMax: 910,
    demand: "ALTA", timeToSell: "4–8 días"
  },
  {
    id: "macbook-air-m1",
    keywords: ["macbook air m1", "macbook air", "macbook"],
    marketAvg: 645, marketRangeMin: 620, marketRangeMax: 670,
    probableResellMin: 630, probableResellMax: 655,
    demand: "ALTA", timeToSell: "4–8 días"
  },
  {
    id: "switch-oled",
    keywords: ["nintendo switch oled"],
    marketAvg: 245, marketRangeMin: 230, marketRangeMax: 260,
    probableResellMin: 240, probableResellMax: 255,
    demand: "ALTA", timeToSell: "5–10 días"
  },
  {
    id: "switch-lite",
    keywords: ["nintendo switch lite", "switch lite"],
    marketAvg: 175, marketRangeMin: 160, marketRangeMax: 190,
    probableResellMin: 170, probableResellMax: 180,
    demand: "ALTA", timeToSell: "4–8 días"
  },
  {
    id: "nintendo-switch",
    keywords: ["nintendo switch segunda mano", "nintendo switch", "switch"],
    marketAvg: 210, marketRangeMin: 160, marketRangeMax: 260,
    probableResellMin: 200, probableResellMax: 245,
    demand: "ALTA", timeToSell: "5–10 días"
  },
  {
    id: "airpods-pro",
    keywords: ["airpods pro segunda mano", "airpods pro", "airpods"],
    marketAvg: 170, marketRangeMin: 160, marketRangeMax: 180,
    probableResellMin: 165, probableResellMax: 175,
    demand: "ALTA", timeToSell: "7–14 días"
  },
  {
    id: "rtx-3070",
    keywords: ["rtx 3070 segunda mano", "rtx 3070", "rtx3070"],
    marketAvg: 330, marketRangeMin: 310, marketRangeMax: 350,
    probableResellMin: 320, probableResellMax: 340,
    demand: "MEDIA", timeToSell: "3–7 días"
  },
  {
    id: "xbox-series-x",
    keywords: ["xbox series x segunda mano", "xbox series x"],
    marketAvg: 340, marketRangeMin: 310, marketRangeMax: 370,
    probableResellMin: 330, probableResellMax: 355,
    demand: "ALTA", timeToSell: "4–9 días"
  },
  {
    id: "xbox-series-s",
    keywords: ["xbox series s", "xbox series", "xbox"],
    marketAvg: 220, marketRangeMin: 205, marketRangeMax: 240,
    probableResellMin: 215, probableResellMax: 230,
    demand: "ALTA", timeToSell: "3–7 días"
  },
  {
    id: "samsung-galaxy-s24",
    keywords: ["samsung galaxy s24", "galaxy s24"],
    marketAvg: 580, marketRangeMin: 540, marketRangeMax: 640,
    probableResellMin: 555, probableResellMax: 610,
    demand: "ALTA", timeToSell: "3–7 días"
  },
  {
    id: "samsung-galaxy-s23",
    keywords: ["samsung galaxy s23", "galaxy s23"],
    marketAvg: 420, marketRangeMin: 395, marketRangeMax: 455,
    probableResellMin: 405, probableResellMax: 440,
    demand: "ALTA", timeToSell: "3–6 días"
  },
  {
    id: "samsung-galaxy",
    keywords: ["samsung galaxy segunda mano", "samsung galaxy", "samsung", "galaxy"],
    marketAvg: 430, marketRangeMin: 150, marketRangeMax: 680,
    probableResellMin: 400, probableResellMax: 445,
    demand: "ALTA", timeToSell: "3–6 días"
  },
  {
    id: "ipad-pro",
    keywords: ["ipad pro"],
    marketAvg: 700, marketRangeMin: 580, marketRangeMax: 820,
    probableResellMin: 660, probableResellMax: 750,
    demand: "ALTA", timeToSell: "4–8 días"
  },
  {
    id: "ipad-air",
    keywords: ["ipad air m1", "ipad air"],
    marketAvg: 480, marketRangeMin: 440, marketRangeMax: 530,
    probableResellMin: 460, probableResellMax: 505,
    demand: "ALTA", timeToSell: "4–8 días"
  },
  {
    id: "ipad",
    keywords: ["ipad segunda mano", "ipad"],
    marketAvg: 430, marketRangeMin: 180, marketRangeMax: 750,
    probableResellMin: 420, probableResellMax: 445,
    demand: "ALTA", timeToSell: "4–8 días"
  },
  {
    id: "gopro-hero12",
    keywords: ["gopro hero 12", "gopro hero12"],
    marketAvg: 260, marketRangeMin: 230, marketRangeMax: 290,
    probableResellMin: 245, probableResellMax: 270,
    demand: "MEDIA", timeToSell: "5–12 días"
  },
  {
    id: "gopro-hero11",
    keywords: ["gopro hero 11", "gopro hero11"],
    marketAvg: 190, marketRangeMin: 165, marketRangeMax: 215,
    probableResellMin: 178, probableResellMax: 200,
    demand: "MEDIA", timeToSell: "5–12 días"
  },
  {
    id: "gopro",
    keywords: ["gopro segunda mano", "gopro"],
    marketAvg: 180, marketRangeMin: 100, marketRangeMax: 280,
    probableResellMin: 175, probableResellMax: 190,
    demand: "MEDIA", timeToSell: "7–15 días"
  },
  {
    id: "bicicleta-electrica",
    keywords: ["bicicleta electrica segunda mano", "bicicleta electrica", "bici electrica"],
    marketAvg: 850, marketRangeMin: 400, marketRangeMax: 1800,
    probableResellMin: 780, probableResellMax: 950,
    demand: "ALTA", timeToSell: "7–20 días"
  },
  {
    id: "patinete-electrico",
    keywords: ["patinete electrico segunda mano", "patinete electrico", "patinete"],
    marketAvg: 210, marketRangeMin: 80, marketRangeMax: 500,
    probableResellMin: 195, probableResellMax: 240,
    demand: "ALTA", timeToSell: "3–8 días"
  },
  {
    id: "dyson-v15",
    keywords: ["dyson v15"],
    marketAvg: 390, marketRangeMin: 350, marketRangeMax: 440,
    probableResellMin: 370, probableResellMax: 415,
    demand: "ALTA", timeToSell: "4–10 días"
  },
  {
    id: "dyson-v12",
    keywords: ["dyson v12"],
    marketAvg: 300, marketRangeMin: 265, marketRangeMax: 340,
    probableResellMin: 280, probableResellMax: 320,
    demand: "ALTA", timeToSell: "4–10 días"
  },
  {
    id: "dyson-v11",
    keywords: ["dyson v11"],
    marketAvg: 230, marketRangeMin: 195, marketRangeMax: 265,
    probableResellMin: 215, probableResellMax: 248,
    demand: "ALTA", timeToSell: "4–10 días"
  },
  {
    id: "dyson",
    keywords: ["dyson segunda mano", "dyson"],
    marketAvg: 290, marketRangeMin: 150, marketRangeMax: 450,
    probableResellMin: 270, probableResellMax: 330,
    demand: "ALTA", timeToSell: "4–10 días"
  },
  {
    id: "monitor-4k",
    keywords: ["monitor 4k"],
    marketAvg: 280, marketRangeMin: 190, marketRangeMax: 420,
    probableResellMin: 260, probableResellMax: 310,
    demand: "ALTA", timeToSell: "5–12 días"
  },
  {
    id: "monitor-gaming",
    keywords: ["monitor gaming segunda mano", "monitor gaming"],
    marketAvg: 190, marketRangeMin: 80, marketRangeMax: 600,
    probableResellMin: 180, probableResellMax: 200,
    demand: "ALTA", timeToSell: "3–7 días"
  },
  {
    id: "monitor",
    keywords: ["monitor segunda mano", "monitor"],
    marketAvg: 190, marketRangeMin: 80, marketRangeMax: 600,
    probableResellMin: 180, probableResellMax: 200,
    demand: "ALTA", timeToSell: "3–7 días"
  },
];

/** Busca el producto que mejor coincide con la query (palabra clave más larga). */
function findProduct(q) {
  const lower = q.toLowerCase();
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

  // Cache de 24 horas en el borde de Vercel
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=3600");

  const product = findProduct(q);

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
