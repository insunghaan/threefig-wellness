import { test } from 'node:test';
import assert from 'node:assert/strict';

// Use a local built Worker with THREEFIG_INTERNAL_USER_IDS=threefig-qa-alpha.
const base = process.env.THREEFIG_TEST_URL || 'http://127.0.0.1:4176';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local Worker only.');
const identity = (id) => ({ 'oai-authenticated-user-id': id, 'oai-authenticated-user-email': `${id}@example.test` });
const get = (path, id, extra = {}) => fetch(base + path, { redirect: 'manual', headers: { ...(id ? identity(id) : {}), ...extra } });

test('landing and prototype are public while design and personal APIs remain private', async () => {
  assert.equal((await get('/')).status, 200);
  for (const path of ['/app', '/app/today', '/app/age', '/app/rhythm', '/app/you', '/app/skin/history', '/app/skin/capture']) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), /noindex/);
  }
  for (const path of ['/design']) {
    const response = await get(path);
    assert.ok([302, 303, 307].includes(response.status), `${path}: ${response.status}`);
    assert.match(response.headers.get('location'), /^\/signin-with-chatgpt\?/);
  }
  for (const path of ['/api/records', '/api/skin', '/api/skin/example/photo']) {
    assert.equal((await get(path)).status, 401, path);
  }
});

test('signed-in visitors can browse the prototype but cannot read private records', async () => {
  for (const path of ['/app', '/app/you', '/app/skin/capture']) {
    assert.equal((await get(path, 'outside-visitor')).status, 200, path);
  }
  for (const path of ['/design']) {
    const response = await get(path, 'outside-visitor');
    assert.ok([302, 303, 307].includes(response.status), path);
    assert.equal(response.headers.get('location'), '/app-access', path);
  }
  for (const path of ['/api/records', '/api/skin', '/api/skin/example/photo']) {
    assert.equal((await get(path, 'outside-visitor')).status, 403, path);
  }
});

test('public access does not permit anonymous writes or deletes', async () => {
  for (const path of ['/api/records', '/api/skin']) {
    assert.equal((await fetch(base + path, { method: 'POST', body: '{}' })).status, 401, path);
    assert.equal((await fetch(base + path + '/example', { method: 'DELETE' })).status, 401, path);
  }
});

test('the configured internal account can open app and design routes', async () => {
  for (const path of ['/app', '/app/you', '/app/skin/capture', '/design']) {
    const response = await get(path, 'threefig-qa-alpha');
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /noindex/);
  }
});

 test('access guidance shows only the signed-in identity and redirects members', async () => {
  const anonymous = await get('/app-access');
  assert.match(anonymous.headers.get('location'), /^\/signin-with-chatgpt\?/);
  const visitor = await get('/app-access', 'outside-visitor');
  assert.equal(visitor.status, 200);
  const html = await visitor.text();
  assert.match(html, /outside-visitor@example.test/);
  assert.match(html, /Your access ID/);
  assert.doesNotMatch(html, /threefig-qa-alpha/);
  const member = await get('/app-access', 'threefig-qa-alpha');
  assert.equal(member.headers.get('location'), '/app');
});
