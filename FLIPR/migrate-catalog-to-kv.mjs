/**
 * Migración única: sube SEED_CATALOG (los 32 productos actuales) a Vercel
 * KV / Upstash, para que a partir de ahora el catálogo se pueda editar sin
 * redeploy.
 *
 * Uso:
 *   node scripts/migrate-catalog-to-kv.mjs
 *
 * Requiere que las variables de entorno del almacén estén disponibles en el
 * entorno donde se ejecute (Vercel KV: KV_REST_API_URL / KV_REST_API_TOKEN;
 * o Upstash directo: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
 * En local, puedes exportarlas antes de correr el script, o copiarlas de
 * `vercel env pull` si usas la CLI de Vercel.
 *
 * Es seguro ejecutarlo más de una vez: siempre sobrescribe la clave
 * `flipr:market-catalog` en KV con SEED_CATALOG completo. Si ya has editado
 * el catálogo directamente en KV, NO lo vuelvas a correr sin comprobar antes
 * (te pisaría los cambios).
 */

import { SEED_CATALOG, saveCatalog, getCatalog } from '../lib/catalog.js';

async function main() {
  console.log(`Subiendo ${SEED_CATALOG.length} productos a KV (clave: flipr:market-catalog)...`);

  const ok = await saveCatalog(SEED_CATALOG);
  if (!ok) {
    console.error(
      '❌ No se pudo escribir en KV. Comprueba que KV_REST_API_URL/TOKEN ' +
      '(o UPSTASH_REDIS_REST_URL/TOKEN) están definidas en este entorno.'
    );
    process.exit(1);
  }

  const check = await getCatalog();
  if (check.length !== SEED_CATALOG.length) {
    console.error(`⚠️  Verificación inesperada: KV devolvió ${check.length} productos, se esperaban ${SEED_CATALOG.length}.`);
    process.exit(1);
  }

  console.log(`✅ Catálogo migrado y verificado en KV: ${check.length} productos.`);
  console.log('   A partir de ahora puedes editar productos en KV sin redeploy.');
}

main().catch((e) => {
  console.error('❌ Error inesperado en la migración:', e);
  process.exit(1);
});
