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

import { inferConditionFromDescription } from './flipCalculator.js';

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

/** Extrae la descripción del anuncio del HTML (JSON-LD description, meta description, og:description). */
export function extractDescriptionFromHtml(html) {
  if (!html) return "";
  const tries = [
    /"description"\s*:\s*"([^"]{10,1200})"/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,1200})/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{10,1200})/i,
  ];
  for (const re of tries) {
    const m = html.match(re);
    if (m && m[1]) {
      const d = m[1].replace(/\\n/g, " ").replace(/\\"/g, '"').trim();
      if (d.length >= 10) return d.slice(0, 1200);
    }
  }
  return "";
}

/** Extrae el kilometraje (km) del HTML de un vehículo (JSON estructurado de Wallapop). */
export function extractKmFromHtml(html) {
  if (!html) return null;
  const tries = [
    /"km"\s*:\s*\{\s*"value"\s*:\s*"(\d+)"/i,
    /"value"\s*:\s*"(\d{2,5})\s*km"/i,
    /(\d{2,5})\s*km\s*[·|]/i,
    /(\d{2,5})\s*km\b/i,
  ];
  for (const re of tries) {
    const m = html.match(re);
    if (m && m[1]) {
      const n = parseInt(String(m[1]).replace(/[\s.,]/g, ""), 10);
      if (Number.isFinite(n) && n > 0 && n < 2000000) return n;
    }
  }
  return null;
}

/** Fetch del precio + descripción + km de una página de Wallapop a través del proxy (?url=...). */
async function fetchWallapopInfo(itemPath) {
  if (!itemPath) return null;
  try {
    const target = "https://es.wallapop.com" + itemPath;
    const resp = await fetch(`/api/wallapop?url=${encodeURIComponent(target)}`, {
      headers: { "Accept": "text/html,application/xhtml+xml,application/json" },
    });
    if (!resp.ok) return null;
    const text = await resp.text();
    return {
      price: extractPriceFromHtml(text),
      description: extractDescriptionFromHtml(text),
      km: extractKmFromHtml(text),
    };
  } catch (e) {
    console.log("Wallapop fetch fallback", e);
    return null;
  }
}

/** Intenta leer el precio + descripción de una imagen/captura mediante la Visión IA del servidor. */
export async function readPriceFromImage(imageDataUrl) {
  try {
    const resp = await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl }),
    });
    const data = await resp.json().catch(() => null);
    if (data && data.ok) {
      return {
        ok: true,
        price: data.price || null,
        title: data.title || null,
        condition: data.condition || null,
        description: data.description || "",
        reason: data.reason || null,
      };
    }
    return { ok: false, price: null, title: null, condition: null, description: "", reason: (data && data.reason) || "error" };
  } catch (e) {
    console.log("Vision read fallback", e);
    return { ok: false, price: null, title: null, condition: null, description: "", reason: "error" };
  }
}

/** Pide a la IA que razone sobre el título+descripción y devuelva estado/desperfectos/km. */
async function analyzeDescription(title, description) {
  if (!description || String(description).trim().length < 8) return null;
  try {
    const resp = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: String(title || ""), description: String(description).slice(0, 2500) }),
    });
    const data = await resp.json().catch(() => null);
    if (data && data.ok && data.condition) return data;
    return null;
  } catch (e) {
    console.log("Analyze fallback", e);
    return null;
  }
}

/**
 * Extrae la URL limpia y el posible título a partir de texto compartido desde apps móviles.
 * Ejemplo:
 * "¡Echa un vistazo a este producto en Wallapop! iPhone 13 Pro 128GB: https://es.wallapop.com/item/iphone-13-pro-128gb-10394829"
 * -> { url: "https://es.wallapop.com/item/iphone-13-pro-128gb-10394829", titleFromText: "iPhone 13 Pro 128GB" }
 */
export function extractUrlFromShareText(rawText) {
  if (!rawText || typeof rawText !== 'string') return { url: '', titleFromText: '' };
  const text = rawText.trim();

  // 1) Buscar URL en el texto (http(s)://... o dominio/item/...)
  const match = text.match(/(https?:\/\/[^\s\)\],>"']+)/i) 
    || text.match(/((?:www\.)?(?:es\.)?(?:wallapop\.com|vinted\.[a-z.]+|milanuncios\.com|facebook\.com\/marketplace)[^\s\)\],>"']*)/i);

  if (!match) {
    return { url: text, titleFromText: '' };
  }

  let url = match[1].trim();
  // Limpiar puntuación sobrante al final del link
  url = url.replace(/[.,;!?:]+$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // 2) Intentar extraer el título del texto antes de la URL
  let titleFromText = '';
  try {
    const textBeforeUrl = text.split(match[0])[0].trim();
    if (textBeforeUrl) {
      titleFromText = textBeforeUrl
        .replace(/^[¡!¿?]+/, '')
        .replace(/^(?:echa un vistazo a este producto en wallapop|mira lo que he encontrado en wallapop|mira lo que encontré en wallapop|mira esta oferta en wallapop|mira lo que vende [^:]+ en vinted|echa un vistazo a este anuncio)[!:\s-]*/i, '')
        .replace(/[:\-–—]+$/, '')
        .trim();
    }
  } catch (_) {}

  return { url, titleFromText };
}

export async function parseProductFromImageOrUrl({ file, imageUrl, urlText }) {
  // Pequeña espera para mantener el feedback de "leyendo"
  await new Promise((r) => setTimeout(r, 250));

  if (urlText && urlText.trim().length > 0) {
    const { url: cleanUrl, titleFromText } = extractUrlFromShareText(urlText);
    const isWallapop = cleanUrl.includes('wallapop');
    const isVinted = cleanUrl.includes('vinted');

    let extractedTitle = "";
    let extractedPrice = null;
    let priceDetected = false;
    let priceSource = null; // 'url' | 'wallapop' | 'keyword' | null
    let cleanedSlug = "";
    let itemPath = "";
    let extractedDescription = "";
    let extractedKm = null;

    try {
      const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1] || "";
      itemPath = urlObj.pathname;

      if (lastSegment) {
        cleanedSlug = lastSegment.replace(/-\d{6,}$/g, '');

        // Precio explícito en el slug SÓLO si lleva sufijo "euros/eur/e" (raro en Wallapop).
        // IMPORTANTE: un número final suelto NO se trata como precio: en Wallapop el
        // final suele ser el id del anuncio y un número de 4 cifras puede ser el AÑO
        // (ej. "bmw-serie-5-1998-1295286335" → el "1998" es el año, no el precio).
        const priceMatch = cleanedSlug.match(/-(\d+)-(?:euros?|eur|e)$/i);
        if (priceMatch && priceMatch[1]) {
          const possiblePrice = parseInt(priceMatch[1], 10);
          if (possiblePrice > 5 && possiblePrice < 5000) {
            extractedPrice = possiblePrice;
            priceDetected = true;
            priceSource = 'url';
            cleanedSlug = cleanedSlug.replace(priceMatch[0], '');
          }
        }

        // Título: quitamos ids largos y años (4 cifras entre 1900-2030), pero
        // CONSERVAMOS los números de modelo cortos (ej. "Serie 5", "iPhone 14").
        extractedTitle = cleanedSlug
          .split('-')
          .filter(w => w.length > 0)
          .filter(w => !/^\d{6,}$/.test(w))
          .filter(w => !(/^\d{4}$/.test(w) && +w >= 1900 && +w <= 2030))
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    } catch (e) {
      console.log("Parsing fallback for URL", e);
    }

    // Si el título del slug es muy genérico o vacío pero teníamos texto compartido, usarlo
    if ((!extractedTitle || extractedTitle.length < 3) && titleFromText) {
      extractedTitle = titleFromText;
    } else if (!extractedTitle || extractedTitle.length < 3) {
      extractedTitle = "Producto de " + (isWallapop ? "Wallapop" : isVinted ? "Vinted" : "Marketplace");
    }

    // 2) Precio + descripción reales de Wallapop vía proxy server-side
    if (isWallapop && itemPath) {
      const info = await fetchWallapopInfo(itemPath);
      if (info) {
        if (!priceDetected && info.price) {
          extractedPrice = info.price;
          priceDetected = true;
          priceSource = 'wallapop';
        }
        extractedDescription = info.description;
        extractedKm = info.km || null;
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

    let aiAnalysis = null;
    if (extractedDescription) aiAnalysis = await analyzeDescription(extractedTitle, extractedDescription);
    const inferredConditionUrl = (aiAnalysis && aiAnalysis.condition) || inferConditionFromDescription(extractedTitle + " " + extractedDescription) || "Muy buen estado";
    if (!extractedKm && aiAnalysis && aiAnalysis.km) extractedKm = aiAnalysis.km;
    if (aiAnalysis && aiAnalysis.summary) notes.push(`🔎 ${aiAnalysis.summary}`);

    return {
      title: extractedTitle,
      price: extractedPrice,
      priceDetected,
      priceSource,
      description: extractedDescription,
      km: extractedKm,
      condition: inferredConditionUrl,
      marketplace: marketplaceName,
      accessories: ["Caja original", "Accesorios según anuncio"],
      aiVisionNotes: notes
    };
  }

  // Si es una foto/captura: intentamos leer el precio con visión IA
  if (imageUrl) {
    const vision = await readPriceFromImage(imageUrl);
    const descFromVision = (vision && vision.description) || "";
    const titleFromVision = ((vision && vision.title) || "").trim() || "Producto Detectado por Visión IA";
    const aiFromVision = descFromVision ? await analyzeDescription(titleFromVision, descFromVision) : null;
    const conditionFromVision = (aiFromVision && aiFromVision.condition) || inferConditionFromDescription(titleFromVision + " " + descFromVision) || (vision && vision.condition) || "Muy buen estado";
    if (vision.ok && vision.price) {
      return {
        title: titleFromVision,
        price: vision.price,
        priceDetected: true,
        priceSource: 'vision',
        description: descFromVision,
        condition: conditionFromVision,
        marketplace: "Wallapop",
        accessories: ["Según captura"],
        aiVisionNotes: [
          "Captura analizada por Visión IA.",
          `Precio leído de la imagen: ${vision.price} €.`,
          descFromVision ? `Descripción leída: ${descFromVision}` : ""
        ].filter(Boolean)
      };
    }
    const reason = vision.reason || "";
    const isApiError = /api-error|429|402|quota|credit|insufficient/i.test(reason);
    const aiPriceWarning = isApiError
      ? "⚠️ El servicio de IA del servidor está sin saldo o con límite (error HTTP de OpenRouter/OpenAI, p. ej. 402 sin saldo o 429 límite). Recarga saldo en tu proveedor de IA (OpenRouter) o usa la vía pegando el enlace del anuncio, que no necesita IA. Escribe el precio manualmente."
      : reason === 'no-key'
        ? "⚠️ La lectura por visión no está activada en el servidor (falta OPENAI_API_KEY). Escríbelo manualmente."
        : reason === 'year-confusion'
          ? "⚠️ La IA leyó el AÑO del producto (ej. 1998) como precio y lo hemos descartado para no engañarte. Escribe el precio real (ej. 5500)."
          : "⚠️ No se ha podido leer el precio de la imagen. Escríbelo manualmente antes de analizar.";

    return {
      title: titleFromVision,
      price: null,
      priceDetected: false,
      priceSource: null,
      aiPriceWarning,
      description: descFromVision,
      condition: conditionFromVision,
      marketplace: "Wallapop",
      accessories: ["Según captura"],
      aiVisionNotes: [
        "Captura analizada.",
        aiPriceWarning
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
