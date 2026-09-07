/**
 * FLIPR Internal Links Widget
 * Inyecta una grid de enlaces a todas las landing pages SEO.
 * Se excluye automáticamente la página actual.
 *
 * Uso: <script src="/internal-links-widget.js" data-current="/ps5-segunda-mano"></script>
 */
(function () {
  const script = document.currentScript;
  const current = (script && script.dataset.current) || "";

  const PAGES = [
    { href: "/herramienta-reventa",              label: "Herramienta Reventa",  emoji: "⚡" },
    { href: "/calculadora-beneficio-reventa",     label: "Calculadora Margen",   emoji: "🧮" },
    { href: "/blog",                              label: "Blog de Reventa",      emoji: "📚" },
    { href: "/ps5-segunda-mano",                  label: "PS5",                  emoji: "🎮" },
    { href: "/iphone-segunda-mano",               label: "iPhone",               emoji: "📱" },
    { href: "/macbook-segunda-mano",              label: "MacBook",              emoji: "💻" },
    { href: "/nintendo-switch-segunda-mano",      label: "Nintendo Switch",      emoji: "🕹️" },
    { href: "/airpods-segunda-mano",              label: "AirPods",              emoji: "🎧" },
    { href: "/rtx-3070-segunda-mano",             label: "RTX 3070",             emoji: "🖥️" },
    { href: "/xbox-segunda-mano",                 label: "Xbox",                 emoji: "🎮" },
    { href: "/samsung-segunda-mano",              label: "Samsung Galaxy",       emoji: "📱" },
    { href: "/ipad-segunda-mano",                 label: "iPad",                 emoji: "📟" },
    { href: "/gopro-segunda-mano",                label: "GoPro",                emoji: "📷" },
    { href: "/bicicleta-electrica-segunda-mano",  label: "Bici eléctrica",       emoji: "🚴" },
    { href: "/patinete-electrico-segunda-mano",   label: "Patinete eléctrico",   emoji: "🛴" },
    { href: "/dyson-segunda-mano",                label: "Dyson",                emoji: "🌀" },
    { href: "/monitor-segunda-mano",              label: "Monitor",              emoji: "🖥️" },
    { href: "/steam-deck-segunda-mano",           label: "Steam Deck",           emoji: "🎮" },
    { href: "/apple-watch-segunda-mano",          label: "Apple Watch",          emoji: "⌚" },
    { href: "/zapatillas-segunda-mano",           label: "Zapatillas",           emoji: "👟" },
    { href: "/auriculares-segunda-mano",          label: "Auriculares",          emoji: "🎧" },
  ];

  const links = PAGES.filter((p) => p.href !== current);

  const section = document.createElement("div");
  section.style.cssText = "margin-top:40px;padding-top:28px;border-top:1px solid #1f232d";

  const heading = document.createElement("h2");
  heading.textContent = "Más guías de segunda mano";
  heading.style.cssText = "font-size:18px;font-weight:800;color:#fff;margin-bottom:16px";

  const grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px";

  links.forEach((p) => {
    const a = document.createElement("a");
    a.href = p.href;
    a.style.cssText = [
      "display:flex;align-items:center;gap:8px",
      "background:#12151F;border:1px solid #262a36;border-radius:12px",
      "padding:10px 12px;text-decoration:none",
      "font-size:13px;font-weight:600;color:#d1d5db",
      "transition:border-color .15s",
    ].join(";");
    a.onmouseenter = () => (a.style.borderColor = "#34d399");
    a.onmouseleave = () => (a.style.borderColor = "#262a36");

    const span = document.createElement("span");
    span.textContent = p.emoji + " " + p.label;
    a.appendChild(span);
    grid.appendChild(a);
  });

  section.appendChild(heading);
  section.appendChild(grid);

  // Insertamos antes del .note final o al final del .wrap
  const wrap = document.querySelector(".wrap");
  const note = wrap && wrap.querySelector(".note");
  if (wrap) {
    if (note) wrap.insertBefore(section, note);
    else wrap.appendChild(section);
  }
})();
