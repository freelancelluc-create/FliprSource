/**
 * Serverless Function de Vercel — Migración del catálogo a KV vía navegador
 *
 * GET /api/admin-seed-catalog?secret=<ADMIN_SEED_SECRET>
 *
 * Alternativa sin terminal al script scripts/migrate-catalog-to-kv.mjs: sube
 * SEED_CATALOG a KV con solo visitar esta URL una vez, con el secreto
 * correcto en la query.
 *
 * Requiere la variable de entorno ADMIN_SEED_SECRET configurada en Vercel
 * (Project Settings → Environment Variables). Sin ella, el endpoint se
 * desactiva solo (503) — no hay forma de usarlo por accidente sin haberla
 * puesto tú mismo.
 *
 * Es seguro visitarla más de una vez: siempre sobrescribe la clave
 * `flipr:market-catalog` en KV con SEED_CATALOG completo. Si ya has editado
 * el catálogo directamente en KV, no la vuelvas a visitar sin comprobar
 * antes (te pisaría los cambios).
 *
 * Recomendado: una vez migrado, borra la variable ADMIN_SEED_SECRET de
 * Vercel (o cambia su valor) para desactivar el endpoint.
 */

import { timingSafeEqual } from 'node:crypto';
import { SEED_CATALOG, saveCatalog, getCatalog } from '../lib/catalog.js';

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, reason: 'method-not-allowed' });
    return;
  }

  const configuredSecret = process.env.ADMIN_SEED_SECRET;
  if (!configuredSecret) {
    res.status(503).json({
      ok: false,
      reason: 'no-secret-configured',
      hint: 'Añade ADMIN_SEED_SECRET en Vercel → Settings → Environment Variables y vuelve a desplegar.',
    });
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const providedSecret = url.searchParams.get('secret') || '';

  if (!providedSecret || !safeEqual(providedSecret, configuredSecret)) {
    res.status(401).json({ ok: false, reason: 'invalid-secret' });
    return;
  }

  try {
    const ok = await saveCatalog(SEED_CATALOG);
    if (!ok) {
      res.status(502).json({
        ok: false,
        reason: 'kv-write-failed',
        hint: 'Comprueba que Upstash/KV está conectado a este proyecto en Vercel → Storage.',
      });
      return;
    }
    const check = await getCatalog();
    res.status(200).json({
      ok: true,
      message: `Catálogo migrado a KV: ${check.length} productos.`,
      count: check.length,
    });
  } catch (e) {
    console.log('admin-seed-catalog error', e && e.message);
    res.status(500).json({ ok: false, reason: 'unexpected-error' });
  }
}
