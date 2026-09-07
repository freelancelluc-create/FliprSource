/**
 * FLIPR Market Price Widget
 * Script reutilizable para las landing pages SEO.
 *
 * Uso en el HTML:
 *   <script src="/market-price-widget.js" data-q="ps5" data-fallback-avg="350"
 *           data-fallback-low="330" data-fallback-high="370" data-fallback-max-buy="330"></script>
 *
 * El script busca en el DOM elementos con los siguientes data-price attributes y los rellena:
 *   data-price="avg"      → precio medio
 *   data-price="low"      → precio mínimo (p20)
 *   data-price="high"     → precio máximo (p80)
 *   data-price="range"    → "NNN – NNN €"
 *   data-price="max-buy"  → precio máximo recomendado de compra
 *   data-price="count"    → número de anuncios analizados
 *   data-price="label"    → badge "Actualizado ahora" / "Datos estáticos"
 *
 * Si la llamada a la API falla o tarda más de 4 s, los valores del DOM no se
 * tocan (ya tienen los datos estáticos en el HTML como fallback).
 */

(function () {
  const script = document.currentScript;
  const q = script && script.dataset.q;
  if (!q) return;

  const TIMEOUT_MS = 4000;

  function fmt(n) {
    if (n == null) return "—";
    return n.toLocaleString("es-ES") + " €";
  }

  function fill(attr, value) {
    document.querySelectorAll(`[data-price="${attr}"]`).forEach((el) => {
      el.textContent = value;
    });
  }

  function applyData(d, isLive) {
    if (d.avg != null)    fill("avg",     fmt(d.avg));
    if (d.median != null) fill("median",  fmt(d.median));
    if (d.low != null)    fill("low",     fmt(d.low));
    if (d.high != null)   fill("high",    fmt(d.high));
    if (d.low != null && d.high != null)
      fill("range", d.low.toLocaleString("es-ES") + " – " + d.high.toLocaleString("es-ES") + " €");
    if (d.maxBuy != null) fill("max-buy", fmt(d.maxBuy));
    if (d.count != null)  fill("count",   d.count + " anuncios");

    // Badge de actualización
    fill("label", isLive ? "⚡ Actualizado ahora" : "Datos orientativos");
    document.querySelectorAll("[data-price='label']").forEach((el) => {
      el.style.color = isLive ? "#34d399" : "#6b7280";
    });

    // Actualiza el callout principal si existe
    const calloutBig = document.querySelector(".callout .big");
    if (calloutBig && d.maxBuy != null) {
      calloutBig.textContent = "≈ " + d.maxBuy.toLocaleString("es-ES") + " €";
    }
  }

  // Lanzamos la petición con timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  fetch("/api/market-price?q=" + encodeURIComponent(q) + "&max=20", {
    signal: controller.signal,
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => {
      clearTimeout(timer);
      if (data && data.ok) {
        applyData(data, true);
      }
    })
    .catch(() => {
      clearTimeout(timer);
      // Silencioso: el HTML ya tiene los datos estáticos como fallback
    });
})();
