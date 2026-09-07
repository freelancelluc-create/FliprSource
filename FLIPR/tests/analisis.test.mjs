import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitize } from '../api/analisis.js';

test('sanitize conserva solo los campos de la whitelist', () => {
  const out = sanitize({
    name: 'PS5',
    verdict: 'COMPRALO',
    flipScore: 82,
    marginMin: 20,
    marginMax: 30,
    inputPrice: 250,
    secret: 'no-deberia-guardarse',
    payload: { x: 1 },
  });
  assert.equal(out.name, 'PS5');
  assert.equal(out.verdict, 'COMPRALO');
  assert.equal(out.flipScore, 82);
  assert.equal(out.marginMin, 20);
  assert.equal(out.marginMax, 30);
  assert.equal(out.secret, undefined);
  assert.equal(out.payload, undefined);
});

test('sanitize asigna un nombre por defecto', () => {
  const out = sanitize({ verdict: 'PASA' });
  assert.equal(out.name, 'Producto de segunda mano');
});

test('sanitize limita los arrays de accesorios/razones', () => {
  const out = sanitize({
    name: 'x',
    accessories: Array.from({ length: 20 }, (_, i) => `acc${i}`),
    reasons: ['a', 'b'],
  });
  assert.equal(out.accessories.length, 10);
  assert.deepEqual(out.reasons, ['a', 'b']);
});

test('sanitize devuelve null para entradas no-objeto', () => {
  assert.equal(sanitize(null), null);
  assert.equal(sanitize('texto'), null);
});

test('sanitize conserva los campos de factors que usa el resultado', () => {
  const out = sanitize({
    name: 'PS5',
    factors: [
      { id: 'precio', label: 'Precio', score: 82, weight: 30, hint: 'hint', extra: 'x' },
    ],
  });
  assert.deepEqual(out.factors[0], { id: 'precio', label: 'Precio', score: 82, weight: 30, hint: 'hint' });
  assert.equal(out.factors[0].extra, undefined);
});
