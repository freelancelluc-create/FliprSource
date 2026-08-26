import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFlipScore } from '../src/utils/flipCalculator.js';
import { parseProductFromImageOrUrl } from '../src/utils/aiVisionParser.js';

test('calculateFlipScore - High Profit Item Returns COMPRALO', () => {
  const result = calculateFlipScore({
    title: 'PlayStation 5 Slim',
    buyPrice: 250,
    condition: 'Muy buen estado',
    marketplace: 'Wallapop'
  });

  assert.equal(typeof result.flipScore, 'number');
  assert.ok(result.flipScore >= 80, `Expected score >= 80, got ${result.flipScore}`);
  assert.equal(result.verdict, 'COMPRALO');
  assert.ok(result.estimatedProfitMin > 0);
  assert.ok(result.marginMin > 0);
});

test('calculateFlipScore - Overpriced Item Returns PASA or NEGOCIA', () => {
  const result = calculateFlipScore({
    title: 'AirPods Pro 2',
    buyPrice: 170,
    condition: 'Aceptable',
    marketplace: 'Wallapop'
  });

  assert.equal(typeof result.flipScore, 'number');
  assert.ok(result.verdict === 'NEGOCIA' || result.verdict === 'PASA');
});

test('parseProductFromImageOrUrl - Extracts Title & Price from Wallapop URL', async () => {
  const parsed = await parseProductFromImageOrUrl({
    urlText: 'https://es.wallapop.com/item/playstation-5-slim-250-euros-102938481'
  });

  assert.equal(parsed.marketplace, 'Wallapop');
  assert.ok(parsed.title.includes('Playstation 5 Slim') || parsed.title.length > 5);
  assert.equal(parsed.price, 250);
});
