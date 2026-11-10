// Integration test: real routes + a throwaway SQLite file.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Must be set before the app modules are loaded.
const dbFile = path.join(os.tmpdir(), `astro-test-${process.pid}-${Date.now()}.db`);
process.env.SQLITE_PATH = dbFile;
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
delete process.env.DATABASE_URL;

const express = require('express');
const { initDatabase, closeDatabase } = require('../src/middleware/database');
const { initAstrogamesSchema } = require('../src/services/astrogamesSchema');
const { authRoutes } = require('../src/routes/auth');
const { astrogamesRoutes, startOfWeekIso } = require('../src/routes/astrogames');
const { sanitizeRun } = require('../src/services/astrogamesScoring');

let server;
let base;

async function api(method, url, { token, body } = {}) {
  const response = await fetch(`${base}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json().catch(() => null) };
}

async function register(username) {
  const { data } = await api('POST', '/api/auth/register', {
    body: { email: `${username}@example.com`, username, password: 'correct-horse-battery' },
  });
  return { token: data.token, id: data.user.id };
}

before(async () => {
  await initDatabase();
  await initAstrogamesSchema();
  const app = express();
  app.use(express.json());
  authRoutes(app);
  astrogamesRoutes(app);
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closeDatabase();
  fs.rmSync(dbFile, { force: true });
});

test('sanitizeRun rejects unknown games and clamps impossible values', () => {
  assert.ok(sanitizeRun({ game: 'hack-the-planet', score: 1 }).error);
  assert.ok(sanitizeRun({ game: 'astro-quiz', difficulty: 'godmode' }).error);

  const { run } = sanitizeRun({ game: 'astro-quiz', difficulty: 'hard', score: 9e9, xp: 9e9 });
  assert.strictEqual(run.score, 20000);
  assert.strictEqual(run.xp, 10000);

  assert.strictEqual(sanitizeRun({ game: 'astro-quiz', difficulty: 'easy', score: 500, xp: 500 }).run.xp, 35);
  assert.strictEqual(sanitizeRun({ game: 'astro-quiz', score: -50, xp: -5 }).run.score, 0);
});

test('startOfWeekIso returns the Monday of that week (UTC)', () => {
  assert.strictEqual(startOfWeekIso(new Date('2026-11-10T12:00:00Z')), '2026-11-09T00:00:00.000Z');
  assert.strictEqual(startOfWeekIso(new Date('2026-11-15T23:59:00Z')), '2026-11-09T00:00:00.000Z');
});

test('submitting a score requires authentication', async () => {
  const res = await api('POST', '/api/astrogames/leaderboard', { body: { game: 'astro-quiz', score: 100 } });
  assert.strictEqual(res.status, 401);
});

test('scores are attributed to the token, not the request body', async () => {
  const alice = await register('alice');
  const res = await api('POST', '/api/astrogames/leaderboard', {
    token: alice.token,
    body: { game: 'astro-quiz', difficulty: 'medium', score: 800, xp: 400, userId: 9999, userEmail: 'victim@example.com', name: 'Victim' },
  });
  assert.strictEqual(res.status, 201);

  const board = await api('GET', '/api/astrogames/leaderboard?game=astro-quiz');
  assert.strictEqual(board.data.length, 1);
  assert.strictEqual(board.data[0].user_id, alice.id);
  assert.strictEqual(board.data[0].name, 'alice');
  assert.ok(!('user_email' in board.data[0]), 'emails must not be exposed publicly');
});

test('a retried submission is not counted twice', async () => {
  const bob = await register('bob');
  const body = { game: 'orbit-match', difficulty: 'hard', score: 1000, xp: 500, clientRunId: 'run-1' };
  const first = await api('POST', '/api/astrogames/leaderboard', { token: bob.token, body });
  const retry = await api('POST', '/api/astrogames/leaderboard', { token: bob.token, body });
  assert.strictEqual(first.status, 201);
  assert.strictEqual(retry.status, 200);
  assert.strictEqual(retry.data.duplicate, true);
  assert.strictEqual(retry.data.totalXp, 500);
});

test('global leaderboard sums XP per player in SQL, with numeric totals', async () => {
  const carol = await register('carol');
  await api('POST', '/api/astrogames/leaderboard', { token: carol.token, body: { game: 'astro-quiz', difficulty: 'hard', score: 1000, xp: 700, clientRunId: 'a' } });
  await api('POST', '/api/astrogames/leaderboard', { token: carol.token, body: { game: 'meteor-dash', difficulty: 'hard', score: 500, xp: 300, clientRunId: 'b' } });

  const { data } = await api('GET', '/api/astrogames/leaderboard?game=global');
  const entry = data.find((row) => row.name === 'carol');
  assert.strictEqual(entry.xp, 1000);
  assert.strictEqual(entry.gamesPlayed, 2);
  assert.strictEqual(data[0].name, 'carol', 'highest XP ranks first');
  assert.ok(!('userEmail' in entry));
});

test('daily XP can only be claimed once per day and counts toward the total', async () => {
  const dave = await register('dave');
  const first = await api('POST', '/api/astrogames/daily-claim', { token: dave.token });
  const second = await api('POST', '/api/astrogames/daily-claim', { token: dave.token });
  assert.strictEqual(first.data.claimed, true);
  assert.strictEqual(second.data.claimed, false);

  const me = await api('GET', '/api/astrogames/me', { token: dave.token });
  assert.strictEqual(me.data.xp, 100);
  assert.strictEqual(me.data.dailyClaimed, true);
});

test('invalid game filters are rejected', async () => {
  const res = await api('GET', '/api/astrogames/leaderboard?game=nope');
  assert.strictEqual(res.status, 400);
});
