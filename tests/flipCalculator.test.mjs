import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFlipScore } from '../src/utils/flipCalculator.js';

test('con marketData: la Rieju a 1€ es COMPRALO con mercado real', () => {
  const md = {
    marketAvg: 1250,
    marketRangeMin: 1050,
    marketRangeMax: 1450,
    probableResellMin: 1150,
    probableResellMax: 1350,
    demand: 'MEDIA',
    risk: 'MEDIO',
    liquidity: 'MEDIA',
    timeToSell: '15-30 días',
    category: 'Motocicletas',
  };
  const r = calculateFlipScore({
    title: 'Rieju Mrx Pro Supermotard Negra',
    buyPrice: 1,
    condition: 'Muy buen estado',
    marketplace: 'Wallapop',
    accessories: ['Caja original'],
    marketData: md,
  });
  assert.equal(r.usedMarketData, true);
  assert.equal(r.marketRangeMin, 1050);
  assert.equal(r.marketRangeMax, 1450);
  assert.ok(r.estimatedProfitMin > 900, 'beneficio mínimo alto');
  assert.equal(r.verdict, 'COMPRALO');
});

test('con marketData: precio por encima de mercado -> NEGOCIA/PASA', () => {
  const md = {
    marketAvg: 350,
    marketRangeMin: 330,
    marketRangeMax: 370,
    probableResellMin: 340,
    probableResellMax: 360,
    demand: 'ALTA',
    risk: 'BAJO',
    liquidity: 'FÁCIL',
    timeToSell: '3-7 días',
  };
  const r = calculateFlipScore({ title: 'PS5', buyPrice: 700, condition: 'Muy buen estado', marketData: md });
  assert.equal(r.usedMarketData, true);
  // comprar por encima del mercado no debe ser COMPRALO
  assert.notEqual(r.verdict, 'COMPRALO');
});

test('sin marketData: heurística (estimación)', () => {
  const r = calculateFlipScore({ title: 'Cafetera', buyPrice: 50, condition: 'Muy buen estado', accessories: [] });
  assert.equal(r.usedMarketData, false);
  assert.ok(r.marketRangeMax > r.marketRangeMin, 'rango de mercado válido');
  assert.ok(r.inputPrice === 50);
});
