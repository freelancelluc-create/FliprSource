import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrice, extractJsonObject, looksLikeYear } from '../api/vision.js';

test('normalizePrice: formatos españoles, rangos y limpieza', () => {
  assert.equal(normalizePrice('5500'), 5500);
  assert.equal(normalizePrice('5.500 €'), 5500);
  assert.equal(normalizePrice('5,500'), 5500);
  assert.equal(normalizePrice('€450'), 450);
  assert.equal(normalizePrice(' 320 €'), 320);
  assert.equal(normalizePrice('1.234,56'), 1235);
  // Rango -> primera cifra
  assert.equal(normalizePrice('5500 - 6000'), 5500);
  assert.equal(normalizePrice('1200 a 1500'), 1200);
  assert.equal(normalizePrice('abc'), null);
  assert.equal(normalizePrice(''), null);
  assert.equal(normalizePrice(null), null);
});

test('extractJsonObject: JSON plano, con fences y con prefijo', () => {
  const plain = '{"price":5500,"title":"BMW Serie 5","condition":"Buen estado","description":"coche"}';
  assert.deepEqual(extractJsonObject(plain), { price: 5500, title: 'BMW Serie 5', condition: 'Buen estado', description: 'coche' });

  const fenced = '```json\n{"price":5500,"title":"BMW Serie 5"}\n```';
  assert.deepEqual(extractJsonObject(fenced), { price: 5500, title: 'BMW Serie 5' });

  const prefixed = 'Aquí tienes el resultado: {"price": 1200} y nada más';
  assert.deepEqual(extractJsonObject(prefixed), { price: 1200 });

  assert.equal(extractJsonObject('no json'), null);
  assert.equal(extractJsonObject(''), null);
  assert.equal(extractJsonObject(null), null);
});

test('extractJsonObject: JSON anidado con llaves internas', () => {
  const nested = '{"offers":{"price":5500},"title":"BMW"}';
  assert.deepEqual(extractJsonObject(nested), { offers: { price: 5500 }, title: 'BMW' });
});

test('looksLikeYear: evita confundir el año del coche con el precio', () => {
  assert.equal(looksLikeYear(1998, 'BMW Serie 5 1998'), true);
  assert.equal(looksLikeYear(1998, 'BMW Serie 5 1998, 210000 km, buen estado'), true);
  assert.equal(looksLikeYear(5500, 'BMW Serie 5 1998'), false);
  assert.equal(looksLikeYear(1998, 'BMW Serie 5'), false);
  assert.equal(looksLikeYear(null, 'x'), false);
  assert.equal(looksLikeYear('1998', 'BMW Serie 5 1998'), true);
});
