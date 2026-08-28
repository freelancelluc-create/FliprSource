/**
 * Configuración de FLIPR
 *
 * PAYMENTS_ENABLED:
 *   false = MODO PRUEBAS: el botón "Comprar" añade créditos gratis al instante
 *           (sin cobrar). Perfecto mientras tus amigos prueban la web.
 *   true  = PAGO REAL: el botón "Comprar" abre Stripe Checkout con
 *           Google Pay / Apple Pay. Requiere STRIPE_SECRET_KEY en Vercel.
 */
export const PAYMENTS_ENABLED = true;
