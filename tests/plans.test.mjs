import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLANS, findPlan } from '../src/data/plans.js';

test('hay 3 planes con créditos y precios coherentes', () => {
  assert.equal(PLANS.length, 3);
  for (const p of PLANS) {
    assert.ok(p.id, 'tiene id');
    assert.ok(p.credits > 0, 'créditos positivos');
    assert.ok(p.price > 0, 'precio positivo');
  }
});

test('findPlan localiza por id', () => {
  assert.equal(findPlan('pro').credits, 60);
  assert.equal(findPlan('boost').price, 19.99);
});

test('findPlan devuelve null para id desconocido', () => {
  assert.equal(findPlan('nope'), null);
});
