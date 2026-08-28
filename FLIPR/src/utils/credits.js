/**
 * Sistema de créditos FLIPR (monetización).
 *
 * Para el MVP se guarda en localStorage. Estructurado en funciones puras para
 * poder sustituirlo por llamadas a un backend (cuentas + pagos) sin tocar la UI.
 *
 * - Cada análisis consume 1 crédito.
 * - Comienzas con FREE_CREDITS gratis.
 * - Cuando te quedas sin créditos, la app bloquea el análisis y muestra el upsell.
 */

const STORAGE_KEY = "flipr_credits";
export const FREE_CREDITS = 3;

function read() {
  try {
    const n = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    return Number.isFinite(n) && n >= 0 ? n : FREE_CREDITS;
  } catch (e) {
    return FREE_CREDITS;
  }
}

function write(n) {
  try {
    localStorage.setItem(STORAGE_KEY, String(n));
  } catch (e) {
    /* silencioso: en entornos sin localStorage no persiste */
  }
}

export function getCredits() {
  return read();
}

export function setCredits(n) {
  const safe = Number.isFinite(n) && n >= 0 ? Math.round(n) : FREE_CREDITS;
  write(safe);
  return safe;
}

export function addCredits(n) {
  const next = Math.max(0, read() + Math.round(n));
  write(next);
  return next;
}

/** Consume 1 crédito. Devuelve true si había saldo y se descontó. */
export function spendCredit() {
  const current = read();
  if (current <= 0) return false;
  write(current - 1);
  return true;
}

export function hasCredits() {
  return read() > 0;
}
