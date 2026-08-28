import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFlipScore, computeFlipFactors } from '../src/utils/flipCalculator.js';

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

test('el resultado incluye 5 factores con puntuación 0-100', () => {
  const md = { marketAvg: 350, marketRangeMin: 330, marketRangeMax: 370, probableResellMin: 340, probableResellMax: 360, demand: 'ALTA', risk: 'BAJO', liquidity: 'FÁCIL', timeToSell: '3-7 días' };
  const r = calculateFlipScore({ title: 'PS5', buyPrice: 250, condition: 'Muy buen estado', marketData: md });
  assert.equal(r.factors.length, 5);
  for (const f of r.factors) {
    assert.ok(f.score >= 0 && f.score <= 100, `${f.label} fuera de rango`);
    assert.ok(f.weight > 0, `${f.label} sin peso`);
  }
  assert.deepEqual(r.factors.map((f) => f.id), ['precio', 'margen', 'demanda', 'riesgo', 'velocidad']);
});

test('flipScore = media ponderada de los 5 factores', () => {
  const md = { marketAvg: 1250, marketRangeMin: 1050, marketRangeMax: 1450, probableResellMin: 1150, probableResellMax: 1350, demand: 'MEDIA', risk: 'MEDIO', liquidity: 'MEDIA', timeToSell: '15-30 días' };
  const r = calculateFlipScore({ title: 'Rieju', buyPrice: 1, condition: 'Muy buen estado', marketData: md });
  const expected = Math.round(r.factors.reduce((acc, f) => acc + f.score * f.weight, 0) / 100);
  assert.equal(r.flipScore, expected);
});

test('computeFlipFactors: un producto caro vs mercado puntúa bajo en Precio', () => {
  const { factors, weightedScore } = computeFlipFactors({ price: 700, marketAvg: 350, marginMin: 0, marginMax: 0, demand: 'ALTA', risk: 'BAJO', liquidity: 'FÁCIL' });
  const precio = factors.find((f) => f.id === 'precio');
  assert.equal(precio.score, 0);
  assert.ok(weightedScore < 60);
});

test('calcula el beneficio al precio objetivo (profitAtTarget)', () => {
  const md = { marketAvg: 350, marketRangeMin: 330, marketRangeMax: 370, probableResellMin: 340, probableResellMax: 360, demand: 'ALTA', risk: 'BAJO', liquidity: 'FÁCIL', timeToSell: '3-7 días' };
  // Caso NEGOCIA: el precio actual (300 €) está por encima del precio máximo (276 €)
  const r = calculateFlipScore({ title: 'PS5', buyPrice: 300, condition: 'Muy buen estado', marketData: md });
  assert.ok(r.profitAtTargetMin >= 0);
  assert.ok(r.profitAtTargetMin <= r.profitAtTargetMax);
  assert.ok(r.targetOfferMin > 0 && r.targetOfferMin <= r.maxRecommendedBuy);
  assert.ok(r.maxRecommendedBuy < r.inputPrice, 'el precio máximo debe ser menor que el actual en este caso');
  // Al bajar del precio actual (300 €) al objetivo (276 €), el beneficio sube
  assert.ok(r.profitAtTargetMin > r.estimatedProfitMin);
});

test('la descripción con problemas (a reparar) baja el score y marca riesgo alto', () => {
  const md = { marketAvg: 1250, marketRangeMin: 1050, marketRangeMax: 1450, probableResellMin: 1150, probableResellMax: 1350, demand: 'MEDIA', risk: 'MEDIO', liquidity: 'MEDIA', timeToSell: '15-30 días' };
  const sin = calculateFlipScore({ title: 'Rieju', buyPrice: 800, condition: 'Muy buen estado', marketData: md });
  const con = calculateFlipScore({ title: 'Rieju', buyPrice: 800, condition: 'Muy buen estado', marketData: md, description: 'La moto está a reparar, no arranca y le falta una pieza' });
  assert.ok(con.flipScore < sin.flipScore, 'debe penalizar el score');
  assert.equal(con.risk, 'ALTO');
});
