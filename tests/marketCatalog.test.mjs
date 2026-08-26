import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findMarketData } from '../src/data/marketCatalog.js';

test('reconoce la Rieju MRX Pro', () => {
  const md = findMarketData('Rieju Mrx Pro Supermotard Negra');
  assert.ok(md, 'debe encontrar la moto');
  assert.equal(md.id, 'rieju-mrx-pro');
  assert.equal(md.category, 'Motocicletas');
});

test('reconoce PS5', () => {
  const md = findMarketData('PlayStation 5 Slim Edición 1TB');
  assert.ok(md);
  assert.equal(md.id, 'ps5-slim');
});

test('reconoce MacBook Air M1 (palabra clave específica)', () => {
  const md = findMarketData('MacBook Air M1 8GB');
  assert.equal(md.id, 'macbook-air-m1');
});

test('producto desconocido -> null', () => {
  assert.equal(findMarketData('Cafetera Nespresso'), null);
});

test('título vacío/ausente -> null', () => {
  assert.equal(findMarketData(''), null);
  assert.equal(findMarketData(null), null);
});
