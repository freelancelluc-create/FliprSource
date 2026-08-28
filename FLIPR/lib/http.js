/**
 * Utilidades HTTP para serverless functions con la firma clásica `(req, res)`.
 * Esta es la forma que soporta cualquier versión de Vercel (Node runtime).
 */

export function json(res, obj, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}

/** Lee el header Authorization (soporta req de Node y Headers de Web Request). */
export function bearer(req) {
  let h = "";
  if (req && req.headers) {
    if (typeof req.headers.get === "function") {
      h = req.headers.get("authorization") || "";
    } else {
      h = req.headers.authorization || req.headers["authorization"] || "";
    }
  }
  return h.startsWith("Bearer ") ? h.slice(7).trim() : "";
}

/** Lee y parsea el cuerpo JSON (usa req.body si existe; si no, lee el stream). */
export async function readBody(req) {
  if (req && req.body && typeof req.body === "object") return req.body;
  return await new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

/** Devuelve el origin (esquema + host) a partir de req. */
export function originOf(req) {
  const host = (req.headers && (req.headers.host || req.headers["x-forwarded-host"])) || "";
  return `https://${host}`;
}
