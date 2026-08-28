/**
 * Utilidades de autenticación (solo servidor).
 * Hashing de contraseñas con scrypt de Node (sin dependencias) y tokens de sesión.
 */

import { scryptSync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

/** Devuelve { salt, hash } para una contraseña. */
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return { salt, hash };
}

/** Comprueba una contraseña contra un hash guardado. */
export function verifyPassword(password, salt, hash) {
  try {
    const candidate = scryptSync(String(password), String(salt), 64);
    const stored = Buffer.from(String(hash), "hex");
    return candidate.length === stored.length && timingSafeEqual(candidate, stored);
  } catch (e) {
    return false;
  }
}

export function newToken() {
  return randomBytes(32).toString("hex");
}

export function newUserId() {
  return randomUUID();
}
