import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatShareSummary, 
  formatTweetText, 
  getWhatsAppShareUrl, 
  getTelegramShareUrl, 
  getTwitterShareUrl 
} from '../src/utils/share.js';
import analisisHandler from '../api/analisis.js';

test('formatShareSummary formatea correctamente el resumen de análisis', () => {
  const mockResult = {
    name: 'PlayStation 5 con 2 Mandos',
    verdict: 'COMPRALO',
    flipScore: 88,
    inputPrice: 320,
    estimatedProfitMin: 60,
    estimatedProfitMax: 90,
    maxRecommendedBuy: 340,
  };

  const summary = formatShareSummary(mockResult, 'https://www.fliprscore.com/a/abc-123');
  assert.ok(summary.includes('PlayStation 5'));
  assert.ok(summary.includes('COMPRALO'));
  assert.ok(summary.includes('88/100'));
  assert.ok(summary.includes('320€'));
  assert.ok(summary.includes('https://www.fliprscore.com/a/abc-123'));
});

test('getWhatsAppShareUrl genera URL válida para WhatsApp', () => {
  const url = getWhatsAppShareUrl('Prueba de texto con espacios y acentos');
  assert.ok(url.startsWith('https://api.whatsapp.com/send?text='));
  assert.ok(url.includes('Prueba%20de%20texto'));
});

test('getTwitterShareUrl genera URL válida para Twitter/X', () => {
  const url = getTwitterShareUrl('Mira esto', 'https://www.fliprscore.com/a/123');
  assert.ok(url.startsWith('https://twitter.com/intent/tweet?'));
  assert.ok(url.includes('url=https%3A%2F%2Fwww.fliprscore.com%2Fa%2F123'));
});

test('api/analisis.js?format=og genera SVG con cabeceras y dimensiones correctas', async () => {
  let output = '';
  let headers = {};

  const req = {
    query: {
      format: 'og',
      title: 'Nintendo Switch OLED',
      score: '92',
      verdict: 'COMPRALO',
      price: '210',
      profit: '40-60'
    },
    headers: {}
  };

  const res = {
    statusCode: 200,
    setHeader(k, v) { headers[k] = v; },
    end(data) { output = data; }
  };

  await analisisHandler(req, res);

  assert.equal(headers['Content-Type'], 'image/svg+xml; charset=utf-8');
  assert.ok(output.includes('<svg'));
  assert.ok(output.includes('width="1200"'));
  assert.ok(output.includes('height="630"'));
  assert.ok(output.includes('Nintendo Switch OLED'));
  assert.ok(output.includes('92'));
  assert.ok(output.includes('CÓMPRALO'));
});

test('api/analisis.js?format=html genera HTML con meta tags Open Graph', async () => {
  let output = '';
  let headers = {};

  const req = {
    query: { format: 'html', id: 'test-id' },
    headers: { host: 'www.fliprscore.com' }
  };

  const res = {
    statusCode: 200,
    setHeader(k, v) { headers[k] = v; },
    end(data) { output = data; }
  };

  await analisisHandler(req, res);

  assert.equal(headers['Content-Type'], 'text/html; charset=utf-8');
  assert.ok(output.includes('property="og:title"'));
  assert.ok(output.includes('property="og:image"'));
  assert.ok(output.includes('name="twitter:card"'));
  assert.ok(output.includes('api/og?id=test-id'));
});
