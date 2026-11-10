const { dbRun, dbAll, usingPostgres } = require('../middleware/database');

// Run once at startup (see index.js). Previously these CREATE/ALTER statements
// ran on every request, which is slow and races when requests arrive together.

const scoresTable = usingPostgres
  ? `CREATE TABLE IF NOT EXISTS astrogames_scores (
      id SERIAL PRIMARY KEY,
      game TEXT NOT NULL,
      name TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      difficulty TEXT,
      won BOOLEAN DEFAULT false,
      guesses INTEGER DEFAULT 0,
      time_sec INTEGER DEFAULT 0,
      target TEXT,
      pct REAL DEFAULT 0,
      user_id INTEGER DEFAULT NULL,
      user_email TEXT,
      user_name TEXT,
      challenge_type TEXT,
      challenge_title TEXT,
      challenge_id TEXT,
      global_score INTEGER DEFAULT 0,
      time_ms INTEGER DEFAULT 0,
      client_run_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  : `CREATE TABLE IF NOT EXISTS astrogames_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game TEXT NOT NULL,
      name TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      difficulty TEXT,
      won INTEGER DEFAULT 0,
      guesses INTEGER DEFAULT 0,
      time_sec INTEGER DEFAULT 0,
      target TEXT,
      pct REAL DEFAULT 0,
      user_id INTEGER DEFAULT NULL,
      user_email TEXT,
      user_name TEXT,
      challenge_type TEXT,
      challenge_title TEXT,
      challenge_id TEXT,
      global_score INTEGER DEFAULT 0,
      time_ms INTEGER DEFAULT 0,
      client_run_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

// Bonus XP that isn't tied to a played run (e.g. the daily login reward).
// The unique index makes "claim once per day" a database guarantee instead of
// a localStorage flag the user could clear.
const xpEventsTable = usingPostgres
  ? `CREATE TABLE IF NOT EXISTS astrogames_xp_events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      day TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  : `CREATE TABLE IF NOT EXISTS astrogames_xp_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      kind TEXT NOT NULL,
      day TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;

// Columns added after the first deploy; kept so older databases are upgraded.
const SCORE_COLUMNS = {
  user_id: 'INTEGER DEFAULT NULL',
  xp: 'INTEGER DEFAULT 0',
  user_email: 'TEXT',
  user_name: 'TEXT',
  challenge_type: 'TEXT',
  challenge_title: 'TEXT',
  challenge_id: 'TEXT',
  global_score: 'INTEGER DEFAULT 0',
  time_ms: 'INTEGER DEFAULT 0',
  client_run_id: 'TEXT',
};

async function ensureScoreColumns() {
  if (usingPostgres) {
    for (const [name, definition] of Object.entries(SCORE_COLUMNS)) {
      await dbRun(`ALTER TABLE astrogames_scores ADD COLUMN IF NOT EXISTS ${name} ${definition}`);
    }
    return;
  }
  const existing = new Set((await dbAll('PRAGMA table_info(astrogames_scores)')).map((column) => column.name));
  for (const [name, definition] of Object.entries(SCORE_COLUMNS)) {
    if (!existing.has(name)) await dbRun(`ALTER TABLE astrogames_scores ADD COLUMN ${name} ${definition}`);
  }
}

async function initAstrogamesSchema() {
  await dbRun(scoresTable);
  await ensureScoreColumns();
  await dbRun(xpEventsTable);

  // Indexes match the queries the leaderboard actually runs.
  await dbRun('CREATE INDEX IF NOT EXISTS astrogames_scores_game_score_idx ON astrogames_scores (game, score DESC)');
  await dbRun('CREATE INDEX IF NOT EXISTS astrogames_scores_user_idx ON astrogames_scores (user_id)');
  await dbRun('CREATE INDEX IF NOT EXISTS astrogames_scores_created_idx ON astrogames_scores (created_at)');
  // A retried submission (same user + same client_run_id) can't be counted twice.
  await dbRun('CREATE UNIQUE INDEX IF NOT EXISTS astrogames_scores_run_unique ON astrogames_scores (user_id, client_run_id)');
  await dbRun('CREATE UNIQUE INDEX IF NOT EXISTS astrogames_xp_events_unique ON astrogames_xp_events (user_id, kind, day)');
}

module.exports = { initAstrogamesSchema };
