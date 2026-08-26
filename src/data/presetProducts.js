export const PRESET_PRODUCTS = [
  {
    id: "ps5-slim",
    name: "PlayStation 5 Slim (Edición Chasis D con Lector)",
    category: "Consolas",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80",
    inputPrice: 250,
    condition: "Muy buen estado",
    accessories: ["Caja original", "Mando DualSense extra", "Cable HDMI 2.1"],
    marketplace: "Wallapop",
    verdict: "COMPRALO", // COMPRALO | NEGOCIA | PASA
    flipScore: 91,
    marketRangeMin: 330,
    marketRangeMax: 370,
    maxRecommendedBuy: 275,
    probableResellMin: 340,
    probableResellMax: 360,
    estimatedProfitMin: 55,
    estimatedProfitMax: 85,
    marginMin: 20,
    marginMax: 31,
    demand: "ALTA",
    risk: "BAJO",
    liquidity: "FÁCIL",
    timeToSell: "3–7 días",
    confidence: 94,
    reasons: [
      "El precio pedido de 250 € está un 24% por debajo de la media de mercado (350 €).",
      "Alta rotación en Wallapop: Las PS5 con caja se venden en menos de 5 días.",
      "Incluye 2º mando y caja original, lo que permite vender en la franja alta (360 €).",
      "Comisiones de plataforma estimadas en ~15 € y coste de envío cubierto por el comprador."
    ],
    negotiationTip: "Aunque 250 € ya es un ofertón, puedes ofrecer 235 € en mano si vas a recogerla hoy mismo.",
    negociarTemplate: "¡Hola! Me interesa la PS5 Slim. ¿Podría recogerla hoy mismo por 235 € en mano y te evitas líos de envíos?",
    listingTitle: "PlayStation 5 Slim + 2 Mandos DualSense + Caja Original (Impecable)",
    listingDescription: `En venta PS5 Slim en estado impecable, casi sin uso.
    
- Incluye consola, cableado original y caja.
- Regulado con 2 mandos DualSense originales.
- Probada y limpiada, funciona al 100% en silencio.
- Trato en mano o envío rápido bien protegido.`,
    tags: ["ps5", "playstation5", "ps5slim", "dualsense", "consolas", "wallapop"]
  },
  {
    id: "iphone-14-pro",
    name: "iPhone 14 Pro 128GB Negro Espacial",
    category: "Smartphones",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    inputPrice: 520,
    condition: "Como nuevo",
    accessories: ["Salud batería 89%", "Caja original", "Funda MagSafe"],
    marketplace: "Wallapop",
    verdict: "COMPRALO",
    flipScore: 94,
    marketRangeMin: 680,
    marketRangeMax: 740,
    maxRecommendedBuy: 580,
    probableResellMin: 700,
    probableResellMax: 720,
    estimatedProfitMin: 130,
    estimatedProfitMax: 160,
    marginMin: 25,
    marginMax: 30,
    demand: "MUY ALTA",
    risk: "BAJO",
    liquidity: "FÁCIL",
    timeToSell: "2–5 días",
    confidence: 96,
    reasons: [
      "Margen de beneficio excelente superior a 130 € libres.",
      "Demanda voraz: los modelos Pro de iPhone mantienen su valor de reventa todo el año.",
      "Estado 'Como nuevo' con salud de batería en 89% facilita venta premium.",
      "Riesgo financiero casi nulo al precio de 520 €."
    ],
    negotiationTip: "El precio ya deja margen limpio. Cierra rápido el trato antes de que otro comprador se adelante.",
    negociarTemplate: "Buenas! Si me confirmas que la pantalla no tiene rayadas y la salud es 89%, me lo quedo por 500 € hoy mismo.",
    listingTitle: "iPhone 14 Pro 128GB Negro Espacial - Impecable 89% Batería + Caja",
    listingDescription: `Vendo iPhone 14 Pro 128GB en estado impecable, siempre usado con cristal templado y funda.

- Salud de batería: 89%
- Libre de iCloud y listo para configurar.
- Entrega con su caja original y funda de regalo.
- Acepto prueba presencial sin compromiso.`,
    tags: ["iphone14pro", "apple", "iphone", "wallapop", "chollo"]
  },
  {
    id: "switch-oled",
    name: "Nintendo Switch OLED Blanco",
    category: "Consolas",
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&auto=format&fit=crop&q=80",
    inputPrice: 190,
    condition: "Buen estado",
    accessories: ["Dock", "Joy-Cons", "Funda de transporte"],
    marketplace: "Vinted",
    verdict: "NEGOCIA",
    flipScore: 74,
    marketRangeMin: 230,
    marketRangeMax: 260,
    maxRecommendedBuy: 175,
    probableResellMin: 240,
    probableResellMax: 250,
    estimatedProfitMin: 35,
    estimatedProfitMax: 45,
    marginMin: 18,
    marginMax: 23,
    demand: "ALTA",
    risk: "MEDIO",
    liquidity: "FÁCIL",
    timeToSell: "5–10 días",
    confidence: 90,
    reasons: [
      "El beneficio ajustado (35-45 €) tras comisiones deja poco colchón frente a posibles regateos.",
      "El estado es solo 'Buen estado' (marcas menores de uso en carcasa trasera).",
      "Si consigues bajar el precio de compra a 170 €, pasa inmediatamente a CÓMPRALO."
    ],
    negotiationTip: "Usa las marcas de uso o falta de caja original para conseguir una rebaja de 20 €.",
    negociarTemplate: "Hola! Veo que no tiene la caja original. ¿Te parecerían bien 170 € y lo cerramos ya?",
    listingTitle: "Nintendo Switch OLED Blanca + Dock + Funda de Viaje",
    listingDescription: `Nintendo Switch modelo OLED en color blanco.

- Pantalla en perfecto estado, carcasas con leves signos de uso normal.
- Incluye Dock original, cable HDMI, cargador y funda rígida.
- Joy-Cons sin nada de drift comprobados.`,
    tags: ["nintendo", "switcholed", "nintendoswitch", "vinted", "gaming"]
  },
  {
    id: "macbook-air-m1",
    name: "MacBook Air M1 8GB / 256GB Gris Espacial",
    category: "Ordenadores",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80",
    inputPrice: 480,
    condition: "Muy buen estado",
    accessories: ["Cargador original Apple", "Caja"],
    marketplace: "Wallapop",
    verdict: "COMPRALO",
    flipScore: 88,
    marketRangeMin: 620,
    marketRangeMax: 670,
    maxRecommendedBuy: 520,
    probableResellMin: 630,
    probableResellMax: 650,
    estimatedProfitMin: 110,
    estimatedProfitMax: 135,
    marginMin: 22,
    marginMax: 28,
    demand: "ALTA",
    risk: "BAJO",
    liquidity: "MEDIA",
    timeToSell: "4–8 días",
    confidence: 93,
    reasons: [
      "Precio de compra de 480 € muy tentador; el MacBook Air M1 sigue siendo el portátil usado más buscado.",
      "Margen neto superior a 110 € después de comisiones.",
      "Poco riesgo de devaluación rápida."
    ],
    negotiationTip: "Pregunta cuántos ciclos de batería tiene. Si supera los 250 ciclos, pide rebaja a 450 €.",
    negociarTemplate: "Buenas! ¿Cuántos ciclos de batería tiene el MacBook? Si está en buen estado te ofrezco 450 € en mano.",
    listingTitle: "MacBook Air M1 256GB Gris Espacial - Impecable con Caja y Cargador",
    listingDescription: `MacBook Air con chip Apple M1, 8GB RAM y 256GB SSD.

- Funciona ultrarrápido y la batería dura todo el día.
- Teclado y pantalla impolutos.
- Se entrega formateado con macOS Sequoia instalado y listo para usar.`,
    tags: ["macbook", "macbookair", "m1", "apple", "portatil"]
  },
  {
    id: "airpods-pro-2",
    name: "AirPods Pro (2ª Generación con estuche USB-C)",
    category: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    inputPrice: 140,
    condition: "Bueno",
    accessories: ["Caja", "Almohadillas"],
    marketplace: "Wallapop",
    verdict: "PASA",
    flipScore: 42,
    marketRangeMin: 160,
    marketRangeMax: 180,
    maxRecommendedBuy: 110,
    probableResellMin: 165,
    probableResellMax: 175,
    estimatedProfitMin: 10,
    estimatedProfitMax: 20,
    marginMin: 7,
    marginMax: 14,
    demand: "ALTA",
    risk: "ALTO",
    liquidity: "DIFÍCIL",
    timeToSell: "7–14 días",
    confidence: 85,
    reasons: [
      "Riesgo extremo de réplica/falsificación: El mercado de segunda mano está inundado de copias 1:1 difíciles de detectar sin factura oficial de Apple.",
      "El beneficio neto estimado (10-20 €) es insuficiente para compensar la higiene personal y los posibles regateos del comprador final.",
      "Recomendación: No arriesgar capital salvo que tenga factura comprobada de Apple Store / Amazon y compres por debajo de 100 €."
    ],
    negotiationTip: "Solo compra si el vendedor te muestra la factura original de compra y acepta probarlos en el momento con tu iPhone.",
    negociarTemplate: "Hola, ¿tienes la factura de compra original de Apple/El Corte Inglés? De lo contrario no puedo ofrecer más de 90 € por riesgo de réplicas.",
    listingTitle: "AirPods Pro 2ª Gen USB-C (Originales con Factura)",
    listingDescription: `AirPods Pro de 2ª generación con estuche de carga USB-C.

- 100% originales con número de serie comprobable.
- Cancelación de ruido y audio espacial perfectos.
- Almohadillas desinfectadas.`,
    tags: ["airpods", "airpodspro", "apple", "audio"]
  },
  {
    id: "rtx-3070",
    name: "Tarjeta Gráfica Gigabyte RTX 3070 Eagle 8GB",
    category: "Componentes PC",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80",
    inputPrice: 240,
    condition: "Muy buen estado",
    accessories: ["Caja original"],
    marketplace: "Wallapop",
    verdict: "COMPRALO",
    flipScore: 86,
    marketRangeMin: 310,
    marketRangeMax: 350,
    maxRecommendedBuy: 260,
    probableResellMin: 320,
    probableResellMax: 340,
    estimatedProfitMin: 58,
    estimatedProfitMax: 78,
    marginMin: 24,
    marginMax: 32,
    demand: "MEDIA",
    risk: "MEDIO",
    liquidity: "FÁCIL",
    timeToSell: "3–7 días",
    confidence: 91,
    reasons: [
      "Las RTX 3070 se siguen vendiendo en 320-330 € para montajes gaming de gama media-alta.",
      "A 240 € el margen es de casi un 30% limpio.",
      "Asegúrate de pedir un vídeo ejecutando FurMark para descartar temperaturas altas o minería intensiva."
    ],
    negotiationTip: "Pide capturas de temperaturas (GPU-Z/FurMark) antes de cerrar.",
    negociarTemplate: "Hola! Me interesa la gráfica. ¿Me podrías mandar una captura de temperaturas en test? Si está bien me la quedo por 225 €.",
    listingTitle: "Gigabyte GeForce RTX 3070 Eagle 8GB (Excelente estado + Caja)",
    listingDescription: `Tarjeta gráfica Gigabyte RTX 3070 8GB GDDR6.

- Nunca usada para minería, solo gaming casual en torre bien ventilada.
- Temperaturas máximas por debajo de 68ºC en carga.
- Entrega con su caja original.`,
    tags: ["rtx3070", "nvidia", "gpu", "pcmasterrace", "wallapop"]
  }
];
