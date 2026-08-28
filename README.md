# FLIPR — ¿Lo compro o no?

Herramienta de decisión para flippers de segunda mano. Pega un anuncio de Wallapop, Vinted o Facebook Marketplace y obtén en segundos un veredicto claro: **CÓMPRALO / NEGOCIA / PASA**, respaldado por un **FLIP SCORE™ 0–100**, margen estimado, precio máximo de compra y herramientas de acción (mensaje de negociación, generador de anuncio de reventa).

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 · Vite · Tailwind CSS v4 |
| Backend | Vercel Serverless Functions (Node.js) |
| Base de datos | Vercel KV / Upstash Redis (REST) |
| IA | OpenRouter o OpenAI (gpt-4o-mini) |
| Pagos | Stripe Checkout |
| Analytics | Vercel Analytics |

---

## Estructura del proyecto

```
api/
  auth/         → login, register, logout, me, reset-password
  user/         → load, save (historial, favoritos, watchlist, créditos)
  analyze.js    → Análisis de descripción por IA (texto)
  vision.js     → Lectura de captura de pantalla por IA (imagen)
  wallapop.js   → Proxy server-side para scraping de Wallapop
  checkout.js   → Crea sesión de Stripe Checkout
  confirm.js    → Verifica pago y acredita créditos

lib/
  auth.js       → hashPassword, verifyPassword, newToken (node:crypto)
  kv.js         → Cliente REST de Upstash Redis (sin dependencias)
  http.js       → Utilidades HTTP: json(), readBody(), bearer(), originOf()
  rateLimit.js  → Rate limiting por IP/token usando KV

src/
  components/   → 12 componentes React
  utils/
    flipCalculator.js   → Motor FLIP SCORE™ y lógica de valoración
    aiVisionParser.js   → Pipeline URL/imagen → IA → datos del anuncio
    credits.js          → Sistema de créditos (localStorage + sync servidor)
    imageUtils.js       → Compresión de imagen antes de enviar a la IA
  data/
    marketCatalog.js    → Catálogo de 30+ productos con valores de mercado
    plans.js            → Planes de créditos (fuente de verdad para precios)
    presetProducts.js   → 6 análisis de demo precalculados
  auth.js       → Cliente de autenticación (fetch + localStorage)
  config.js     → PAYMENTS_ENABLED flag
```

---

## Variables de entorno (Vercel)

| Variable | Descripción |
|---|---|
| `OPENROUTER_API_KEY` | Clave de OpenRouter (preferida sobre OpenAI) |
| `OPENROUTER_MODEL` | Modelo a usar (por defecto `openai/gpt-4o-mini`) |
| `OPENAI_API_KEY` | Clave de OpenAI (fallback si no hay OpenRouter) |
| `OPENAI_VISION_MODEL` | Modelo de visión de OpenAI (por defecto `gpt-4o-mini`) |
| `KV_REST_API_URL` | URL del almacén Vercel KV / Upstash |
| `KV_REST_API_TOKEN` | Token del almacén Vercel KV / Upstash |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (solo en producción) |

Las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN` también se leen como `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` para compatibilidad con el marketplace de Upstash en Vercel.

---

## Desarrollo local

```bash
npm install
npm run dev        # Vite + Vercel dev server en http://localhost:5173
```

Para que las serverless functions funcionen en local necesitas `vercel dev` (requiere [Vercel CLI](https://vercel.com/docs/cli)):

```bash
npm i -g vercel
vercel dev         # Arranca frontend + funciones en http://localhost:3000
```

Crea un archivo `.env.local` en la raíz con las variables necesarias (ver tabla arriba). El archivo ya está en `.gitignore`.

---

## Monetización

- Cada análisis consume **1 crédito**.
- Los nuevos usuarios reciben **3 créditos gratis**.
- Los planes de pago están en `src/data/plans.js` (Starter 10 cr · Pro 60 cr · Boost 150 cr).
- El flag `PAYMENTS_ENABLED` en `src/config.js` activa/desactiva Stripe. En modo pruebas (`false`) los créditos se añaden gratis al instante.
- El sistema de **referidos** otorga +5 créditos al usuario que invitó cuando alguien se registra con su enlace (`?ref=email`).

---

## FLIP SCORE™

Media ponderada de 5 factores (0–100 cada uno):

| Factor | Peso | Descripción |
|---|---|---|
| Precio | 30% | Descuento respecto al valor de mercado |
| Margen | 30% | Beneficio neto estimado sobre el precio de compra |
| Demanda | 15% | Interés de los compradores en el tipo de producto |
| Riesgo | 15% | Probabilidad de complicaciones (falsificaciones, averías, depreciación) |
| Velocidad | 10% | Facilidad y rapidez de reventa |

- **≥ 68** → CÓMPRALO
- **60–67** → NEGOCIA
- **< 60** → PASA

El score se ajusta automáticamente si la descripción del vendedor menciona averías (−14 pts) o el vehículo tiene kilometraje alto (−12 pts).

---

## Pendiente / Roadmap

- [ ] Alertas automáticas de precio (watchlist activa con cron jobs o WebSockets)
- [ ] Envío de email en reset de contraseña (integrar Resend / Postmark)
- [ ] Verificación de email en el registro
- [ ] Panel de administración y métricas de uso
- [ ] Ampliar catálogo de mercado con datos scrapeados en tiempo real
