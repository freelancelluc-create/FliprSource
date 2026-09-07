import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, newToken, newUserId } from '../lib/auth.js';

test('hashPassword genera salt+hash y verifyPassword valida', () => {
  const { salt, hash } = hashPassword('miClave123');
  assert.ok(salt && hash, 'debe generar salt y hash');
  assert.equal(verifyPassword('miClave123', salt, hash), true);
  assert.equal(verifyPassword('otraClave', salt, hash), false);
});

test('dos hashes del mismo password son distintos (salt aleatorio)', () => {
  const a = hashPassword('abc123');
  const b = hashPassword('abc123');
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
  assert.equal(verifyPassword('abc123', a.salt, a.hash), true);
  assert.equal(verifyPassword('abc123', b.salt, b.hash), true);
});

test('newToken y newUserId son únicos', () => {
  assert.notEqual(newToken(), newToken());
  assert.notEqual(newUserId(), newUserId());
});

test('verifyPassword con datos corruptos devuelve false (no lanza)', () => {
  assert.equal(verifyPassword('x', 'salt', 'no-hex!'), false);
  assert.equal(verifyPassword('x', null, null), false);
});

test('flujo completo: register -> me -> login (con KV simulado)', async () => {
  const store = new Map();
  process.env.KV_REST_API_URL = 'https://fake-kv.example';
  process.env.KV_REST_API_TOKEN = 'test-token';

  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url);
    const auth = (opts.headers || {}).Authorization;
    assert.equal(auth, 'Bearer test-token');
    const command = opts.body ? JSON.parse(opts.body) : null;
    // Upstash REST: POST {url} con ["COMANDO", ...args]
    if (command && Array.isArray(command)) {
      const cmd = (command[0] || '').toLowerCase();
      if (cmd === 'get') {
        const val = store.get(command[1]);
        return { ok: true, json: async () => ({ result: val === undefined ? null : val }) };
      }
      if (cmd === 'set') {
        store.set(command[1], command[2]);
        return { ok: true, json: async () => ({ result: 'OK' }) };
      }
      if (cmd === 'del') {
        store.delete(command[1]);
        return { ok: true, json: async () => ({ result: 1 }) };
      }
    }
    throw new Error('Unexpected fetch: ' + u);
  };

  const { default: authHandler } = await import('../api/auth.js');

  // Mock req/res (firma clásica `(req, res)`)
  const mockRes = () => {
    const res = { statusCode: 200, headers: {}, body: '' };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.end = (d) => { res.body = d; };
    return res;
  };
  const mockReq = (action, body, token) => ({
    headers: { host: 'x.test', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body, // readBody devuelve esto directamente
    url: `/?action=${action}`,
    query: { action },
    method: body ? 'POST' : 'GET',
  });
  const call = async (action, body, token) => {
    const res = mockRes();
    await authHandler(mockReq(action, body, token), res);
    return { status: res.statusCode, data: JSON.parse(res.body || '{}') };
  };

  // Registro
  const r1 = await call('register', { name: 'Ana', email: 'ana@test.com', password: 'clave123' });
  assert.equal(r1.status, 200);
  assert.ok(r1.data.token, 'registro devuelve token');
  assert.equal(r1.data.user.email, 'ana@test.com');

  // me con el token de sesión
  const r2 = await call('me', null, r1.data.token);
  assert.equal(r2.data.user.email, 'ana@test.com');

  // Login correcto
  const r3 = await call('login', { email: 'ana@test.com', password: 'clave123' });
  assert.equal(r3.status, 200);
  assert.ok(r3.data.token);

  // Login con contraseña incorrecta -> 401
  const r4 = await call('login', { email: 'ana@test.com', password: 'mala' });
  assert.equal(r4.status, 401);

  // Email repetido -> 409
  const r5 = await call('register', { name: 'Ana2', email: 'ana@test.com', password: 'clave123' });
  assert.equal(r5.status, 409);

  // Referido: al registrar con ?ref, el que invitó recibe +5 créditos
  await call('register', { name: 'Luis', email: 'luis@test.com', password: 'clave123', ref: 'ana@test.com' });
  const anaData = JSON.parse(store.get('data:ana@test.com'));
  assert.equal(anaData.credits, 5, 'el que invita recibe +5 créditos');
});
