const axios = require('axios');
const logger = require('../utils/logger');
const { dbRun, dbAll, dbGet, usingPostgres } = require('../middleware/database');

const DAILY_QUESTION_POOL = [
  { question: 'Which planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Mercury', 'Jupiter'], answer: 'Mars' },
  { question: 'What is the closest star to Earth?', options: ['The Sun', 'Sirius', 'Proxima Centauri', 'Alpha Centauri'], answer: 'The Sun' },
  { question: 'How many planets are in our solar system?', options: ['8', '7', '9', '10'], answer: '8' },
  { question: 'What galaxy do we live in?', options: ['The Milky Way', 'Andromeda', 'Triangulum', 'Whirlpool'], answer: 'The Milky Way' },
  { question: 'Which planet has the most prominent ring system?', options: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'], answer: 'Saturn' },
  { question: 'What force keeps planets in orbit around the Sun?', options: ['Gravity', 'Magnetism', 'Inertia alone', 'Solar wind'], answer: 'Gravity' },
  { question: 'Which moon of Saturn has a thick nitrogen atmosphere?', options: ['Titan', 'Enceladus', 'Mimas', 'Iapetus'], answer: 'Titan' },
  { question: 'What is the term for the point in an orbit closest to the Sun?', options: ['Perihelion', 'Aphelion', 'Zenith', 'Apogee'], answer: 'Perihelion' },
];

const PRACTICE_QUESTION_POOL = [
  { question: 'Which planet is the largest in our solar system?', options: ['Jupiter', 'Saturn', 'Neptune', 'Mars'], answer: 'Jupiter' },
  { question: 'What is the name of Earth\'s natural satellite?', options: ['The Moon', 'Titan', 'Europa', 'Phobos'], answer: 'The Moon' },
  { question: 'Which planet is known for its blue-green color due to methane?', options: ['Neptune', 'Mercury', 'Mars', 'Venus'], answer: 'Neptune' },
  { question: 'What is the brightest planet in our night sky?', options: ['Venus', 'Mercury', 'Mars', 'Jupiter'], answer: 'Venus' },
  { question: 'What do we call a star system with two stars?', options: ['Binary star', 'Asterism', 'Nebula', 'Galaxy'], answer: 'Binary star' },
];

const ASTRO_KEYWORDS = [
  'planet', 'star', 'moon', 'sun', 'solar', 'galaxy', 'universe', 'astronom',
  'space', 'orbit', 'comet', 'asteroid', 'nebula', 'black hole', 'mars',
  'venus', 'jupiter', 'saturn', 'mercury', 'neptune', 'uranus', 'pluto',
  'cosmic', 'telescope', 'nasa', 'spacecraft', 'satellite', 'meteor',
  'eclipse', 'constellation', 'milky way', 'astronaut', 'rocket',
];

function getSeededQuestions(pool, seed, amount = 5) {
  const start = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % pool.length;
  const picked = [];
  for (let index = 0; index < amount; index += 1) {
    const sourceIndex = (start + index) % pool.length;
    picked.push(pool[sourceIndex]);
  }
  return picked;
}

function buildChallengePayload(type, challengeKey) {
  const pool = type === 'daily' ? DAILY_QUESTION_POOL : PRACTICE_QUESTION_POOL;
  const title = type === 'daily' ? 'Daily Cosmic Sprint' : 'Practice Orbit';
  const description = type === 'daily'
    ? 'A shared daily challenge that everyone sees and can beat together.'
    : 'A lighter practice round you can replay anytime.';
  const difficulty = type === 'daily' ? 'medium' : 'easy';
  return {
    id: `${type}-${challengeKey}`,
    mode: type,
    challengeKey,
    title,
    description,
    difficulty,
    questions: getSeededQuestions(pool, challengeKey, type === 'daily' ? 5 : 4),
  };
}

async function ensureChallengeTable() {
  await dbRun(`CREATE TABLE IF NOT EXISTS astrogames_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL,
    challenge_key TEXT NOT NULL,
    title TEXT,
    description TEXT,
    difficulty TEXT,
    payload TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
  )`);
  await dbRun('CREATE UNIQUE INDEX IF NOT EXISTS astrogames_challenges_unique ON astrogames_challenges (mode, challenge_key)');
}

async function ensureScoresTable() {
  const createSql = usingPostgres
    ? `CREATE TABLE IF NOT EXISTS astrogames_scores (
        id SERIAL PRIMARY KEY,
        game TEXT NOT NULL,
        name TEXT NOT NULL,
        score INTEGER DEFAULT 0,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS astrogames_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game TEXT NOT NULL,
        name TEXT NOT NULL,
        score INTEGER DEFAULT 0,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;
  await dbRun(createSql);

  if (usingPostgres) {
    const columns = await dbAll("SELECT column_name FROM information_schema.columns WHERE table_name = 'astrogames_scores'");
    const existing = new Set(columns.map((column) => column.column_name));
    const addColumn = async (name, definition) => {
      if (!existing.has(name)) {
        await dbRun(`ALTER TABLE astrogames_scores ADD COLUMN IF NOT EXISTS ${name} ${definition}`);
        existing.add(name);
      }
    };
    await addColumn('user_id', 'INTEGER DEFAULT NULL');
    await addColumn('user_email', 'TEXT');
    await addColumn('user_name', 'TEXT');
    await addColumn('challenge_type', 'TEXT');
    await addColumn('challenge_title', 'TEXT');
    await addColumn('challenge_id', 'TEXT');
    await addColumn('global_score', 'INTEGER DEFAULT 0');
    await addColumn('time_ms', 'INTEGER DEFAULT 0');
  } else {
    const columns = await dbAll('PRAGMA table_info(astrogames_scores)');
    const existing = new Set(columns.map((column) => column.name));
    const addColumn = async (name, definition) => {
      if (!existing.has(name)) {
        await dbRun(`ALTER TABLE astrogames_scores ADD COLUMN ${name} ${definition}`);
        existing.add(name);
      }
    };
    await addColumn('user_id', 'INTEGER DEFAULT NULL');
    await addColumn('user_email', 'TEXT');
    await addColumn('user_name', 'TEXT');
    await addColumn('challenge_type', 'TEXT');
    await addColumn('challenge_title', 'TEXT');
    await addColumn('challenge_id', 'TEXT');
    await addColumn('global_score', 'INTEGER DEFAULT 0');
    await addColumn('time_ms', 'INTEGER DEFAULT 0');
  }
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'");
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function fetchLiveAstronomyQuestions(difficultyTier = 'medium', amount = 5) {
  const apiDifficulty = difficultyTier === 'insane' ? 'hard' : difficultyTier;
  try {
    const response = await axios.get('https://opentdb.com/api.php', {
      params: { amount: 50, category: 17, difficulty: apiDifficulty, type: 'multiple' },
      timeout: 8000,
    });
    const payload = response.data;
    if (payload.response_code !== 0 || !Array.isArray(payload.results) || !payload.results.length) {
      throw new Error('No live questions returned');
    }

    const decoded = payload.results.map((item) => ({
      question: decodeHtmlEntities(item.question),
      answer: decodeHtmlEntities(item.correct_answer),
      options: shuffleArray([item.correct_answer, ...item.incorrect_answers].map(decodeHtmlEntities)),
      category: decodeHtmlEntities(item.category),
    }));

    const astronomyMatches = decoded.filter((entry) => ASTRO_KEYWORDS.some((keyword) => entry.question.toLowerCase().includes(keyword)));
    const seen = new Set();
    const pool = [...astronomyMatches, ...decoded];
    const unique = [];
    for (const entry of pool) {
      if (seen.has(entry.question)) continue;
      seen.add(entry.question);
      unique.push(entry);
      if (unique.length >= amount) break;
    }

    if (unique.length < amount) throw new Error('Not enough live questions');
    return unique;
  } catch (error) {
    return null;
  }
}

function astrogamesRoutes(app) {
  app.get('/api/astrogames/challenge', async (req, res) => {
    try {
      await ensureChallengeTable();
      const type = (req.query.type || 'daily').toLowerCase();
      const challengeKey = type === 'daily' ? new Date().toISOString().slice(0, 10) : 'practice';
      const existing = await dbGet('SELECT payload, expires_at FROM astrogames_challenges WHERE mode = ? AND challenge_key = ?', [type, challengeKey]);
      const now = new Date();
      if (existing && (!existing.expires_at || new Date(existing.expires_at) > now)) {
        return res.json(JSON.parse(existing.payload));
      }
      const payload = buildChallengePayload(type, challengeKey);
      const expiresAt = type === 'daily'
        ? new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
        : null;
      await dbRun(
        `INSERT INTO astrogames_challenges (mode, challenge_key, title, description, difficulty, payload, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(mode, challenge_key) DO UPDATE SET
           title = excluded.title,
           description = excluded.description,
           difficulty = excluded.difficulty,
           payload = excluded.payload,
           created_at = excluded.created_at,
           expires_at = excluded.expires_at`,
        [type, challengeKey, payload.title, payload.description, payload.difficulty, JSON.stringify(payload), new Date().toISOString(), expiresAt]
      );
      res.json(payload);
    } catch (error) {
      res.status(500).json({ error: 'Challenge unavailable' });
    }
  });

  app.get('/api/astrogames/live-questions', async (req, res) => {
    try {
      const difficulty = (req.query.difficulty || 'medium').toLowerCase();
      const amount = Number(req.query.amount || 5);
      const questions = await fetchLiveAstronomyQuestions(difficulty, amount);
      if (!questions) {
        return res.status(502).json({ error: 'Unable to fetch astronomy questions' });
      }
      res.json({ questions });
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch astronomy questions' });
    }
  });

  app.get('/api/astrogames/leaderboard', async (req, res) => {
    try {
      const userId = req.query.userId;
      const userEmail = req.query.userEmail;
      let rows;
      if (userId || userEmail) {
        rows = await dbAll(
          'SELECT * FROM astrogames_scores WHERE (user_id = ? OR user_email = ?) ORDER BY created_at DESC LIMIT 40',
          [userId || '', userEmail || '']
        );
      } else {
        rows = await dbAll('SELECT * FROM astrogames_scores ORDER BY created_at DESC LIMIT 20');
      }
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Leaderboard unavailable' });
    }
  });

  app.post('/api/astrogames/leaderboard', async (req, res) => {
    const { game, name, score, total, difficulty, won, guesses, timeSec, target, date, pct, userId, userEmail, userName, challengeType, challengeTitle, challengeId, globalScore, timeMs } = req.body;
    if (!game || !name) return res.status(400).json({ error: 'game and name required' });

    try {
      await ensureScoresTable();
      const insertSql = usingPostgres
        ? 'INSERT INTO astrogames_scores (game, name, score, total, difficulty, won, guesses, time_sec, target, pct, user_id, user_email, user_name, challenge_type, challenge_title, challenge_id, global_score, time_ms, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *'
        : 'INSERT INTO astrogames_scores (game, name, score, total, difficulty, won, guesses, time_sec, target, pct, user_id, user_email, user_name, challenge_type, challenge_title, challenge_id, global_score, time_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const wonValue = usingPostgres ? (won ? true : false) : (won ? 1 : 0);
      const insertParams = [
        game,
        name,
        Number(score) || 0,
        Number(total) || 0,
        difficulty || null,
        wonValue,
        Number(guesses) || 0,
        Number(timeSec) || 0,
        target || null,
        Number(pct) || 0,
        userId || null,
        userEmail || null,
        userName || null,
        challengeType || null,
        challengeTitle || null,
        challengeId || null,
        Number(globalScore) || 0,
        Number(timeMs) || 0,
        date || new Date().toISOString(),
      ];
      logger.debug('Saving leaderboard entry', { game, name, score: insertParams[2], total: insertParams[3], difficulty });

      let saved;
      if (usingPostgres) {
        const result = await dbRun(insertSql, insertParams);
        saved = result.rows?.[0];
      } else {
        await dbRun(insertSql, insertParams);
        const lastId = await dbGet('SELECT last_insert_rowid() AS id');
        saved = await dbGet('SELECT * FROM astrogames_scores WHERE id = ?', [lastId?.id]);
      }

      res.json(saved);
    } catch (error) {
      logger.error('Unable to save leaderboard entry', { message: error.message, stack: error.stack, game, name });
      res.status(500).json({ error: 'Unable to save leaderboard entry' });
    }
  });
}

module.exports = { astrogamesRoutes };
