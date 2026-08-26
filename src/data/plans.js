/**
 * Planes de créditos FLIPR (compartidos entre el frontend y las serverless
 * functions de pago). Los importes aquí son la fuente de verdad: el servidor
 * NUNCA confía en el importe que envía el cliente.
 */

export const PLANS = [
  { id: 'starter', credits: 10, price: 1.99, label: 'Starter', perCredit: '0,20 €' },
  { id: 'pro', credits: 60, price: 9.99, label: 'Pro', perCredit: '0,17 €', featured: true },
  { id: 'boost', credits: 150, price: 19.99, label: 'Boost', perCredit: '0,13 €' },
];

export function findPlan(id) {
  return PLANS.find((p) => p.id === id) || null;
}
