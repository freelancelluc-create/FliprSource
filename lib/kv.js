/**
 * Cliente de Vercel KV / Upstash Redis vía su API REST de comandos.
 * Sin dependencias: usa fetch + las variables de entorno del almacén.
 * Acepta las de Vercel KV (KV_REST_API_URL/TOKEN) y las de Upstash
 * vía marketplace (UPSTASH_REDIS_REST_URL/TOKEN).
 *
 * Usa la interfaz de comandos de Upstash: POST {URL} con el cuerpo
 * ["COMANDO", arg1, arg2]. Es la más robusta y documentada.
 */

const BASE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

function configured() {
  return !!(BASE && TOKEN);
}

// fetch con timeout (6s) que no reviente si la red/Upstash no responde
async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Ejecuta un comando Redis a través de la REST API de Upstash.
// body: ["SET", key, value] / ["GET", key] / ["DEL", key]
async function runCommand(command) {
  if (!configured()) return null;
  try {
    const r = await fetchWithTimeout(BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!r.ok) {
      console.log("upstash status", r.status, "url", BASE);
      return null;
    }
    return await r.json().catch(() => null);
  } catch (e) {
    console.log("upstash error", e && e.message);
    return null;
  }
}

export async function kvGet(key) {
  const data = await runCommand(["GET", key]);
  const raw = data && data.result;
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return raw;
  }
}

export async function kvSet(key, value) {
  const data = await runCommand(["SET", key, JSON.stringify(value)]);
  return !!data && data.result !== undefined;
}

export async function kvDel(key) {
  const data = await runCommand(["DEL", key]);
  return !!data;
}
