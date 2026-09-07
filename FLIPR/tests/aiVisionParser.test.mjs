import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrice, extractPriceFromHtml, parseProductFromImageOrUrl, extractUrlFromShareText } from '../src/utils/aiVisionParser.js';

test('extractUrlFromShareText: extrae URL limpia de texto compartido en Wallapop móvil', () => {
  const raw = '¡Echa un vistazo a este producto en Wallapop! iPhone 13 Pro 128GB: https://es.wallapop.com/item/iphone-13-pro-128gb-10394829';
  const res = extractUrlFromShareText(raw);
  assert.equal(res.url, 'https://es.wallapop.com/item/iphone-13-pro-128gb-10394829');
  assert.equal(res.titleFromText, 'iPhone 13 Pro 128GB');
});

test('extractUrlFromShareText: extrae URL de Vinted o texto con emojis y saltos', () => {
  const raw = 'Mira lo que vende @user en Vinted ✨ \n https://www.vinted.es/items/3948294-abrigo-zara.';
  const res = extractUrlFromShareText(raw);
  assert.equal(res.url, 'https://www.vinted.es/items/3948294-abrigo-zara');
});

test('parse: texto compartido con prefijo móvil es procesado sin errores', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => '<html><script type="application/ld+json">{"offers":{"price":450,"priceCurrency":"EUR"}}</script></html>',
  });
  const raw = '¡Echa un vistazo a este producto en Wallapop! iPhone 13 Pro 128GB: https://es.wallapop.com/item/iphone-13-pro-128gb-10394829';
  const r = await parseProductFromImageOrUrl({ file: null, imageUrl: null, urlText: raw });
  assert.equal(r.price, 450);
  assert.equal(r.title, 'Iphone 13 Pro 128gb');
});

test('normalizePrice: formatos españoles y limpieza', () => {
  assert.equal(normalizePrice('158'), 158);
  assert.equal(normalizePrice('1.234,56'), 1235);
  assert.equal(normalizePrice('1.234'), 1234);
  assert.equal(normalizePrice('1,99'), 2);
  assert.equal(normalizePrice(' 320 €'), 320);
  assert.equal(normalizePrice('abc'), null);
  assert.equal(normalizePrice(''), null);
  assert.equal(normalizePrice(null), null);
});

test('extractPriceFromHtml: JSON-LD offers en euros', () => {
  const html = '<html><head><script type="application/ld+json">{"offers":{"price":158,"priceCurrency":"EUR"}}</script></head></html>';
  assert.equal(extractPriceFromHtml(html), 158);
});

test('extractPriceFromHtml: meta product:price:amount', () => {
  const html = '<html><head><meta property="product:price:amount" content="1234,56"></head></html>';
  assert.equal(extractPriceFromHtml(html), 1235);
});

test('extractPriceFromHtml: sin precio -> null', () => {
  assert.equal(extractPriceFromHtml('<html><body>hola mundo</body></html>'), null);
});

test('parse: URL con precio en el slug (sin fetch)', async () => {
  const url = 'https://example.com/item/playstation-5-slim-250-euros-101010';
  const r = await parseProductFromImageOrUrl({ file: null, imageUrl: null, urlText: url });
  assert.equal(r.price, 250);
  assert.equal(r.priceDetected, true);
  assert.equal(r.priceSource, 'url');
});

test('parse: Wallapop -> el AÑO del slug NO se trata como precio', async () => {
  globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => '<html><body>sin datos</body></html>' });
  const url = 'https://es.wallapop.com/item/bmw-serie-5-1998-1295286335';
  const r = await parseProductFromImageOrUrl({ file: null, imageUrl: null, urlText: url });
  assert.equal(r.price, null);       // 1998 es el año, no el precio
  assert.equal(r.priceDetected, false);
  assert.equal(r.title, 'Bmw Serie 5'); // conserva el número de modelo "5"
});

test('parse: Wallapop -> lee precio real del HTML servido por el proxy', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => '<html><script type="application/ld+json">{"offers":{"price":158,"priceCurrency":"EUR"}}</script></html>',
  });
  const url = 'https://es.wallapop.com/item/rieju-mrx-pro-supermotard-negra-1294319358';
  const r = await parseProductFromImageOrUrl({ file: null, imageUrl: null, urlText: url });
  assert.equal(r.price, 158);
  assert.equal(r.priceSource, 'wallapop');
});

test('parse: Wallapop sin precio en HTML -> honesto (null)', async () => {
  globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => '<html><body>sin datos</body></html>' });
  const url = 'https://es.wallapop.com/item/rieju-mrx-pro-supermotard-negra-1294319358';
  const r = await parseProductFromImageOrUrl({ file: null, imageUrl: null, urlText: url });
  assert.equal(r.price, null);
  assert.equal(r.priceDetected, false);
});

test('parse: captura sin servicio de visión -> no inventa precio', async () => {
  globalThis.fetch = async () => { throw new Error('network down'); };
  const r = await parseProductFromImageOrUrl({ file: null, imageUrl: 'data:image/png;base64,xxx', urlText: null });
  assert.equal(r.price, null);
  assert.equal(r.priceDetected, false);
});
