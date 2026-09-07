/**
 * Eventos de funnel para Vercel Analytics.
 *
 * Usamos la función track() de @vercel/analytics; es un no-op seguro si el
 * script aún no está inyectado (por ejemplo en local o antes de cargar), así
 * que nunca rompe la app. La usamos para medir el funnel del MVP:
 * análisis iniciado/completado -> compartir -> registro -> guardar -> alerta.
 *
 * Convenciones de nombre: snake_case de dominio, no de librería.
 */

import { track } from '@vercel/analytics';

/**
 * Emite un evento de analytics sin romper nada si falla.
 * @param {string} name Nombre del evento.
 * @param {Record<string, string|number|boolean|null>} [props] Propiedades planas.
 */
export function trackEvent(name, props) {
  try {
    if (name && typeof name === 'string') {
      track(name, props || {});
    }
  } catch (_) {
    // silencioso: el analytics nunca debe bloquear la experiencia.
  }
}
