import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateResale } from '../src/utils/priceEstimator.js';

test('devuelve rango real si el producto está en el catálogo', () => {
  const r = estimateResale({ productName: 'iPhone 14 Pro', condition: 'Como nuevo' });
  assert.equal(r.found, true);
  assert.equal(r.productName, 'iPhone 14 Pro');
  // factor "Como nuevo" = 1.38/1.32 ≈ 1.045 → sube un poco respecto al rango base 700-720
  assert.ok(r.min >= 700);
  assert.ok(r.max >= 720);
  assert.ok(r.min < r.max);
});

test('el estado "A reparar" reduce el rango', () => {
  const normal = estimateResale({ productName: 'PS5', condition: 'Muy buen estado' });
  const reparar = estimateResale({ productName: 'PS5', condition: 'A reparar' });
  assert.ok(reparar.min < normal.min);
  assert.ok(reparar.max < normal.max);
});

test('si hay precio de compra, calcula beneficio estimado', () => {
  const r = estimateResale({ productName: 'PS5', condition: 'Muy buen estado', purchasePrice: 300 });
  assert.ok(r.estimatedProfitMin !== null);
  assert.ok(r.estimatedProfitMax >= r.estimatedProfitMin);
});

test('producto desconocido sin precio devuelve rango nulo', () => {
  const r = estimateResale({ productName: 'producto inexistente xyz', condition: 'Muy buen estado' });
  assert.equal(r.found, false);
  assert.equal(r.min, null);
  assert.equal(r.max, null);
});

test('producto desconocido con precio hace una estimación heurística', () => {
  const r = estimateResale({ productName: 'producto inexistente xyz', condition: 'Muy buen estado', purchasePrice: 200 });
  assert.equal(r.found, false);
  assert.ok(r.min > 0);
  assert.ok(r.max >= r.min);
});
