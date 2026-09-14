import assert from 'node:assert/strict';
const origin = process.env.MOBAREZ_TEST_ORIGIN ?? 'http://localhost:3000';
assert.ok(
  ['localhost', '127.0.0.1'].includes(new URL(origin).hostname),
  'Run this mutating smoke test only against a local development server.',
);
const signin = await fetch(`${origin}/signin-with-chatgpt?return_to=%2F`, {
  redirect: 'manual',
});
const cookie = signin.headers.get('set-cookie')?.split(';')[0];
assert.ok(cookie, 'local sign-in cookie');
const get = async () => {
  const res = await fetch(`${origin}/api/game`, {
    headers: { Cookie: cookie },
  });
  assert.equal(res.status, 200);
  return res.json();
};
const post = async (action, revision, requestId = crypto.randomUUID()) => {
  const res = await fetch(`${origin}/api/game`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, revision, requestId }),
  });
  return { status: res.status, data: await res.json() };
};
assert.equal((await fetch(`${origin}/api/game`)).status, 401);
let s = await get();
if (!s.state.characterCreated) {
  const created = await post(
    { type: 'createCharacter', gender: 'female', name: 'پهلوان آزمون' },
    s.revision,
  );
  assert.equal(created.status, 200);
  assert.equal(created.data.state.characterCreated, true);
  s = await get();
}
const action = { type: 'rename', name: 'پهلوان آزمون' };
const id = crypto.randomUUID();
const first = await post(action, s.revision, id);
assert.equal(first.status, 200);
assert.equal(first.data.state.name, action.name);
assert.equal((await get()).state.name, action.name);
const duplicate = await post(action, s.revision, id);
assert.equal(duplicate.status, 200);
assert.equal(duplicate.data.revision, first.data.revision);
const stale = await post(action, s.revision);
assert.equal(stale.status, 409);
s = await get();
const pair = await Promise.all([
  post({ type: 'rename', name: 'پهلوان یک' }, s.revision),
  post({ type: 'rename', name: 'پهلوان دو' }, s.revision),
]);
assert.deepEqual(
  pair.map((r) => r.status).sort((a, b) => a - b),
  [200, 409],
);
assert.equal((await get()).revision, s.revision + 1);
s = await get();
assert.equal(
  (await post({ type: 'buy', itemId: 'invented' }, s.revision)).status,
  400,
);
assert.equal(
  (await post({ type: 'claim', questId: 'dungeon' }, s.revision)).status,
  400,
);
assert.equal((await get()).revision, s.revision);
const bad = await fetch(`${origin}/api/game`, {
  method: 'POST',
  headers: { Cookie: cookie, 'Content-Type': 'application/json' },
  body: '{bad',
});
assert.equal(bad.status, 400);
const cross = await fetch(`${origin}/api/game`, {
  method: 'POST',
  headers: {
    Cookie: cookie,
    'Content-Type': 'application/json',
    'Sec-Fetch-Site': 'cross-site',
  },
  body: JSON.stringify({
    action,
    revision: s.revision,
    requestId: crypto.randomUUID(),
  }),
});
assert.equal(cross.status, 403);
await post({ type: 'rename', name: 'پهلوان تازه‌نفس' }, s.revision);
console.log(
  'PASS: identity, database persistence, duplicate request, stale revision, concurrent writes, invalid item, unearned reward, malformed JSON, cross-site rejection.',
);
