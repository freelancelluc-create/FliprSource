import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VOTE_DEALS, getVoteDeal } from '../src/data/voteDeals.js';

test('VOTE_DEALS tiene productos válidos y completos', () => {
  assert.ok(Array.isArray(VOTE_DEALS));
  assert.ok(VOTE_DEALS.length >= 5);

  for (const deal of VOTE_DEALS) {
    assert.ok(deal.id, 'Debe tener id');
    assert.ok(deal.title, 'Debe tener title');
    assert.ok(deal.price > 0, 'Debe tener price > 0');
    assert.ok(deal.score >= 0 && deal.score <= 100, 'Score 0-100');
    assert.ok(['COMPRALO', 'NEGOCIA', 'PASA'].includes(deal.verdict), 'Veredicto válido');
    assert.ok(deal.communityBuyPct >= 0 && deal.communityBuyPct <= 100, 'Porcentaje comunidad válido');
    assert.ok(deal.summary.length > 10, 'Resumen explicativo presente');
  }
});

test('getVoteDeal rota correctamente en cualquier índice', () => {
  const d0 = getVoteDeal(0);
  assert.strictEqual(d0.id, VOTE_DEALS[0].id);

  const dOverflow = getVoteDeal(VOTE_DEALS.length);
  assert.strictEqual(dOverflow.id, VOTE_DEALS[0].id);

  const dNegative = getVoteDeal(-1);
  assert.ok(dNegative !== null);
});
