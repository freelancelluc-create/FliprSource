/**
 * Servicio Inteligente de Extracción de URLs y Visión IA para FLIPR
 * Procesa dinámicamente cualquier URL de Wallapop, Vinted o Marketplace.
 *
 * Estrategia de precio (en orden):
 *  1. Si el slug de la URL lo trae explícitamente -> se usa tal cual.
 *  2. Si es Wallapop -> fetch server-side vía /api/wallapop (proxy de Vite
 *     en dev / serverless function en prod) y se parsea el precio real.
 *  3. Estimación por palabra clave si reconocemos el producto.
 *  4. Si nada funciona -> price:null + aviso para que el usuario lo rellene
 *     (nunca inventamos una cifra arbitraria).
 *
 * La lectura de precio por captura (Visión IA) se hace en el servidor (api/vision)
 * con la clave OPENAI_API_KEY; aquí solo llamamos al endpoint.
 */

/** Normaliza una cifra extraída (admite "1.234,56", "1234", "1,99"…). */
export function normalizePrice(raw) {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).replace(/€|\s|EUR|euros?/gi, "").trim();
  if (!s || !/\d/.test(s)) return null;
  if (/^\d+(\.\d{2})?$/.test(s)) {
    // entero o decimal con punto
  } else if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) {
    // "1.234,56" o "1.234" (separador de miles español)
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+,\d{1,2}$/.test(s)) {
    // "1234,56"
    s = s.replace(",", ".");
  } else {
    s = s.replace(/[^\d.]/g, "");
  }
  const n = parseFloat(s);
  if (Number.isFinite(n) && n > 0 && n < 1_000_000) return Math.round(n);
  return null;
}

/** Extrae el precio de un HTML de Wallapop (solo estructuras fiables, en euros). */
export function extractPriceFromHtml(html) {
  if (!html) return null;
  const tries = [
    // JSON-LD offers.price (schema.org → unidades mayores, p.ej. euros)
    /"offers"\s*:\s*\{[^}]*?"priceCurrency"\s*:\s*"EUR"[^}]*?"price"\s*:\s*"?([\d.,]+)"?/i,
    /"offers"\s*:\s*\{[^}]*?"price"\s*:\s*"?([\d.,]+)"?/i,
    // meta product:price:amount
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']?([\d.,]+)/i,
    // microdata itemprop=price
    /itemprop=["']price["'][^>]*content=["']?([\d.,]+)/i,
    /<meta[^>]+itemprop=["']price["'][^>]+content=["']?([\d.,]+)/i,
  ];
  for (const re of tries) {
    const m = html.match(re);
    if (m && m[1]) {
      const p = normalizePrice(m[1]);
      // Rango de cordura para artículos de segunda mano (evita leer céntimos como euros)
      if (p && p >= 5 && p <= 100000) return p;
    }
  }
  return null;
}

/** Fetch del precio real de una página de Wallapop a través del proxy de Vite. */
async function fetchWallapopPrice(itemPath) {
  if (!itemPath) return null;
  try {
    const resp = await fetch(`/api/wallapop${itemPath}`, {
      headers: { "Accept": "text/html,application/xhtml+xml,application/json" },
    });
    if (!resp.ok) return null;
    const text = await resp.text();
    return extractPriceFromHtml(text);
  } catch (e) {
    console.log("Wallapop fetch fallback", e);
    return null;
  }
}

/** Intenta leer el precio de una imagen/captura mediante la Visión IA del servidor. */
export async function readPriceFromImage(imageDataUrl) {
  try {
    const resp = await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl }),
    });
    const data = await resp.json().catch(() => null);
    if (data && data.ok && data.price) return { ok: true, price: data.price };
    return { ok: false, price: null, reason: (data && data.reason) || "error" };
  } catch (e) {
    console.log("Vision read fallback", e);
    return { ok: false, price: null, reason: "error" };
  }
}

export async function parseProductFromImageOrUrl({ file, imageUrl, urlText }) {
  // Pequeña espera para mantener el feedback de "leyendo"
  await new Promise((r) => setTimeout(r, 250));

  if (urlText && urlText.trim().length > 0) {
    const cleanUrl = urlText.trim();
    const isWallapop = cleanUrl.includes('wallapop');
    const isVinted = cleanUrl.includes('vinted');

    let extractedTitle = "";
    let extractedPrice = null;
    let priceDetected = false;
    let priceSource = null; // 'url' | 'wallapop' | 'keyword' | null
    let cleanedSlug = "";
    let itemPath = "";

    try {
      const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1] || "";
      itemPath = urlObj.pathname;

      if (lastSegment) {
        cleanedSlug = lastSegment.replace(/-\d{6,}$/g, '');

        // Precio explícito en el slug (raro en Wallapop, común en otros)
        const priceMatch = cleanedSlug.match(/-(\d+)-(?:euros?|eur|e)$/i) || cleanedSlug.match(/-(\d+)$/);
        if (priceMatch && priceMatch[1]) {
          const possiblePrice = parseInt(priceMatch[1], 10);
          if (possiblePrice > 5 && possiblePrice < 5000) {
            extractedPrice = possiblePrice;
            priceDetected = true;
            priceSource = 'url';
            cleanedSlug = cleanedSlug.replace(priceMatch[0], '');
          }
        }

        extractedTitle = cleanedSlug
          .split('-')
          .filter(w => w.length > 0 && !/^\d+$/.test(w))
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    } catch (e) {
      console.log("Parsing fallback for URL", e);
    }

    if (!extractedTitle || extractedTitle.length < 3) {
      extractedTitle = "Producto de " + (isWallapop ? "Wallapop" : isVinted ? "Vinted" : "Marketplace");
    }

    // 2) Precio real de Wallapop vía proxy server-side
    if (isWallapop && !priceDetected && itemPath) {
      const realPrice = await fetchWallapopPrice(itemPath);
      if (realPrice) {
        extractedPrice = realPrice;
        priceDetected = true;
        priceSource = 'wallapop';
      }
    }

    // 3) Estimación best-effort por palabra clave
    if (!priceDetected) {
      const lowerSlug = cleanedSlug.replace(/-/g, ' ').toLowerCase();
      const priceByKeyword = {
        'ps5': 270, 'playstation 5': 270,
        'iphone 14': 530, 'iphone 13': 440,
        'switch': 185, 'nintendo': 185,
        'macbook': 520, 'airpods': 135,
        'rtx': 240, 'grafica': 240,
        'zapatillas': 110, 'jordan': 110
      };
      const matchedKey = Object.keys(priceByKeyword).find(k => lowerSlug.includes(k));
      if (matchedKey) {
        extractedPrice = priceByKeyword[matchedKey];
        priceDetected = true;
        priceSource = 'keyword';
      }
    }

    const marketplaceName = isWallapop ? "Wallapop" : isVinted ? "Vinted" : "Marketplace";
    const notes = [];

    if (priceDetected && extractedPrice !== null) {
      const how = priceSource === 'wallapop'
        ? "Precio real leído del anuncio (vía proxy)"
        : priceSource === 'url'
          ? "Precio extraído directamente de la URL"
          : "Precio estimado por palabras clave del título";
      notes.push(
        `URL procesada de ${marketplaceName}: "${extractedTitle}".`,
        `${how}: ${extractedPrice} €.`
      );
      if (priceSource === 'keyword') {
        notes.push("Es una estimación: confirma el precio real antes de analizar.");
      }
    } else {
      notes.push(
        `URL procesada de ${marketplaceName}: "${extractedTitle}".`,
        "⚠️ No se ha podido extraer el precio del anuncio. Escríbelo manualmente antes de analizar."
      );
    }

    return {
      title: extractedTitle,
      price: extractedPrice,
      priceDetected,
      priceSource,
      condition: "Muy buen estado",
      marketplace: marketplaceName,
      accessories: ["Caja original", "Accesorios según anuncio"],
      aiVisionNotes: notes
    };
  }

  // Si es una foto/captura: intentamos leer el precio con visión IA
  if (imageUrl) {
    const vision = await readPriceFromImage(imageUrl);
    if (vision.ok && vision.price) {
      return {
        title: "Producto Detectado por Visión IA",
        price: vision.price,
        priceDetected: true,
        priceSource: 'vision',
        condition: "Muy buen estado",
        marketplace: "Wallapop",
        accessories: ["Según captura"],
        aiVisionNotes: [
          "Captura analizada por Visión IA.",
          `Precio leído de la imagen: ${vision.price} €.`
        ]
      };
    }
    return {
      title: "Producto Detectado por Visión IA",
      price: null,
      priceDetected: false,
      priceSource: null,
      condition: "Muy buen estado",
      marketplace: "Wallapop",
      accessories: ["Según captura"],
      aiVisionNotes: [
        "Captura analizada.",
        vision.reason === 'no-key'
          ? "ℹ️ La lectura por visión no está activada en el servidor (falta OPENAI_API_KEY). Escríbelo manualmente."
          : "⚠️ No se ha podido leer el precio de la imagen. Escríbelo manualmente antes de analizar."
      ]
    };
  }

  // Último recurso
  return {
    title: "Producto Detectado por Visión IA",
    price: null,
    priceDetected: false,
    priceSource: null,
    condition: "Muy buen estado",
    marketplace: "Wallapop",
    accessories: ["Según captura"],
    aiVisionNotes: ["⚠️ No se ha podido leer el precio. Escríbelo manualmente antes de analizar."]
  };
}
