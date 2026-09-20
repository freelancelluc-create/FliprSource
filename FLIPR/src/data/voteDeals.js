/**
 * Catálogo de productos para la feature viral "¿Comprarías esto?" (Sección 6 del Brief).
 * Cada producto tiene un precio anunciado realista, su veredicto FLIP SCORE oficial,
 * la explicación de por qué es o no un buen trato y votos base de la comunidad.
 */

export const VOTE_DEALS = [
  {
    id: "ps5-slim-240",
    title: "PlayStation 5 Slim con 2 Mandos",
    price: 240,
    marketAvg: 360,
    resellRange: "340 – 370 €",
    potentialProfit: "+85 €",
    score: 88,
    verdict: "COMPRALO",
    verdictColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80",
    marketplace: "Wallapop",
    condition: "Como nuevo",
    communityBuyPct: 82,
    summary: "Precio un 33% por debajo del valor de mercado. Con 2 mandos originales la reventa es inmediata en menos de 4 días.",
    presetId: "ps5-slim"
  },
  {
    id: "iphone-14-pro-580",
    title: "iPhone 14 Pro 128GB Batería 88%",
    price: 580,
    marketAvg: 620,
    resellRange: "600 – 630 €",
    potentialProfit: "+15 €",
    score: 65,
    verdict: "NEGOCIA",
    verdictColor: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    marketplace: "Wallapop",
    condition: "Buen estado",
    communityBuyPct: 44,
    summary: "A 580 € el margen tras comisiones y envío es casi nulo. Oferta 520 € para asegurar al menos +60 € de beneficio neto.",
    presetId: "iphone-14-pro"
  },
  {
    id: "airpods-pro-2-50",
    title: "AirPods Pro 2ª Gen (Precintados)",
    price: 50,
    marketAvg: 190,
    resellRange: "0 – 0 €",
    potentialProfit: "-50 €",
    score: 28,
    verdict: "PASA",
    verdictColor: "text-red-400 bg-red-500/15 border-red-500/30",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    marketplace: "Vinted",
    condition: "Nuevo",
    communityBuyPct: 29,
    summary: "🚨 Alerta de réplica: el 95% de AirPods Pro precintados por menos de 90 € en Vinted/Wallapop son copias falsas con número de serie clonado.",
    presetId: "airpods-pro-2"
  },
  {
    id: "macbook-air-m1-420",
    title: "MacBook Air M1 256GB Gris Espacial",
    price: 420,
    marketAvg: 580,
    resellRange: "550 – 600 €",
    potentialProfit: "+115 €",
    score: 91,
    verdict: "COMPRALO",
    verdictColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80",
    marketplace: "Wallapop",
    condition: "Muy buen estado",
    communityBuyPct: 89,
    summary: "El MacBook Air M1 mantiene una demanda altísima y precio muy estable. Margen neto superior a 100 €.",
    presetId: "macbook-air-m1"
  },
  {
    id: "switch-oled-140",
    title: "Nintendo Switch OLED Blanca Completa",
    price: 140,
    marketAvg: 230,
    resellRange: "210 – 240 €",
    potentialProfit: "+65 €",
    score: 93,
    verdict: "COMPRALO",
    verdictColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&auto=format&fit=crop&q=80",
    marketplace: "Wallapop",
    condition: "Muy buen estado",
    communityBuyPct: 94,
    summary: "Chollo claro: valor de reventa inmediato entre 210€ y 240€ con venta en menos de 48 horas.",
    presetId: "nintendo-switch-oled"
  },
  {
    id: "rtx-3070-310",
    title: "Gigabyte RTX 3070 Gaming OC 8GB",
    price: 310,
    marketAvg: 300,
    resellRange: "280 – 310 €",
    potentialProfit: "-25 €",
    score: 48,
    verdict: "PASA",
    verdictColor: "text-red-400 bg-red-500/15 border-red-500/30",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80",
    marketplace: "Wallapop",
    condition: "Buen estado",
    communityBuyPct: 31,
    summary: "Las GPU de serie 3000 siguen bajando de precio con la llegada de nuevas generaciones. A 310 € asumirías pérdidas tras comisiones.",
    presetId: "rtx-3070"
  }
];

export function getVoteDeal(index) {
  if (!VOTE_DEALS.length) return null;
  const safeIdx = Math.abs(index) % VOTE_DEALS.length;
  return VOTE_DEALS[safeIdx];
}
