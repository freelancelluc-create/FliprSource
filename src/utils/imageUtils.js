/**
 * Utilidades de imagen para FLIPR (solo navegador).
 *
 * prepareImageForVision(): reduce y comprime una captura subida antes de enviarla
 * a la Visión IA. Tres ventajas:
 *   1. Evita el error "image-too-large" (413) de /api/vision con capturas grandes.
 *   2. Acelera la petición y reduce el coste de tokens.
 *   3. Mejora la precisión de lectura del precio: los modelos de visión OCR
 *      mucho mejor cuando el texto no está a resolución gigante.
 */

const MAX_DIM = 1400; // lado mayor máximo (px). Con detail:high GPT-4o-mini lee bien hasta ~1568px.
const MIN_DIM = 640;  // no necesitamos reducir por debajo de esto.
const JPEG_QUALITY = 0.85;

/**
 * Carga un dataURL en un elemento <img> del navegador.
 * @param {string} src dataURL o URL de imagen
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen para el análisis."));
    img.src = src;
  });
}

/**
 * Reduce una imagen (dataURL/URL) a un tamaño razonable y la devuelve como JPEG dataURL.
 * Respeta la relación de aspecto y nunca amplía imágenes ya pequeñas.
 * @param {string} src          imagen de entrada (dataURL o URL de objeto)
 * @param {object} [opts]
 * @param {number} [opts.maxDim] lado mayor máximo en px
 * @param {number} [opts.quality] calidad JPEG (0-1)
 * @returns {Promise<string>} dataURL JPEG optimizada
 */
export async function prepareImageForVision(src, opts = {}) {
  const maxDim = opts.maxDim || MAX_DIM;
  const quality = opts.quality || JPEG_QUALITY;

  const img = await loadImage(src);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) throw new Error("Imagen no válida.");

  const longSide = Math.max(w, h);
  let scale = 1;
  if (longSide > maxDim) scale = maxDim / longSide;
  else if (longSide < MIN_DIM) scale = Math.min(1, MIN_DIM / longSide); // no agrandar demasiado

  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, outW, outH);

  let out = canvas.toDataURL("image/jpeg", quality);

  // Si aun así tiene un tamaño enorme (capturas muy densas), baja la calidad.
  let guard = 0;
  while (out.length > 4_500_000 && guard < 3) {
    const q = Math.max(0.4, quality - 0.15 * (guard + 1));
    out = canvas.toDataURL("image/jpeg", q);
    guard++;
  }

  return out;
}
