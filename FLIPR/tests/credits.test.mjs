import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mock de localStorage para que credits.js (que lee/escribe ahí) funcione en Node.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const { getCredits, setCredits, addCredits, spendCredit, hasCredits, FREE_CREDITS } =
  await import('../src/utils/credits.js');

test('empieza con los créditos gratis', () => {
  store.clear();
  assert.equal(getCredits(), FREE_CREDITS);
  assert.equal(hasCredits(), true);
});

test('spendCredit descuenta 1 y devuelve true si hay saldo', () => {
  store.clear();
  setCredits(3);
  assert.equal(spendCredit(), true);
  assert.equal(getCredits(), 2);
  assert.equal(hasCredits(), true);
});

test('no gasta si no hay saldo (límite)', () => {
  store.clear();
  setCredits(0);
  assert.equal(spendCredit(), false);
  assert.equal(getCredits(), 0);
  assert.equal(hasCredits(), false);
});

test('addCredits suma y nunca baja de 0', () => {
  store.clear();
  setCredits(0);
  addCredits(5);
  assert.equal(getCredits(), 5);
  addCredits(-10);
  assert.equal(getCredits(), 0);
});
