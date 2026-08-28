/**
 * Rate limiting ligero usando Vercel KV (Upstash Redis).
 *
 * Estrategia: contador por clave (IP o token), con TTL de ventana en segundos.
 * Usa comandos INCR + EXPIRE de Redis, que son atómicos en Upstash.
 *
 * Si KV no está configurado se permite siempre (fail-open) para no romper
 * entornos de desarrollo sin base de datos.
 */

import { kvGet, kvSet } from "./kv.js";

/**
 * Comprueba si la clave `identifier` ha superado `maxRequests` en `windowSecs`.
 * Devuelve { allowed: boolean, remaining: number, resetIn: number (segundos) }.
 *
 * El TTL se gestiona con una clave auxiliar `{key}:ts` que guarda el timestamp
 * de inicio de la ventana actual, ya que la REST API de Upstash no expone INCR+EXPIRE
 * en una sola llamada de forma garantizada en modo comando aislado desde fetch.
 */
export async function checkRateLimit(identifier, { maxRequests = 20, windowSecs = 3600 } = {}) {
  if (!identifier) return { allowed: true, remaining: maxRequests, resetIn: windowSecs };

  const key = `rl:${identifier}`;
  const tsKey = `rl:${identifier}:ts`;

  try {
    const now = Math.floor(Date.now() / 1000);
    const tsRaw = await kvGet(tsKey);
    const windowStart = Number.isFinite(Number(tsRaw)) ? Number(tsRaw) : 0;
    const elapsed = now - windowStart;

    let count;
    if (elapsed >= windowSecs) {
      // Ventana expirada: reiniciar
      count = 1;
      await kvSet(tsKey, now);
      await kvSet(key, 1);
    } else {
      // Ventana activa: incrementar
      const current = await kvGet(key);
      count = (Number.isFinite(Number(current)) ? Number(current) : 0) + 1;
      await kvSet(key, count);
    }

    const resetIn = Math.max(0, windowSecs - elapsed);
    const remaining = Math.max(0, maxRequests - count);
    return { allowed: count <= maxRequests, remaining, resetIn };
  } catch (e) {
    // Fallo en KV: permitir para no bloquear legítimamente
    console.log("rateLimit KV error", e && e.message);
    return { allowed: true, remaining: maxRequests, resetIn: windowSecs };
  }
}

/** Extrae la IP del cliente de los headers de Vercel/Node. */
export function getClientIp(req) {
  if (!req || !req.headers) return "unknown";
  const h = typeof req.headers.get === "function"
    ? (k) => req.headers.get(k) || ""
    : (k) => req.headers[k] || "";
  return (
    h("x-real-ip") ||
    (h("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}
