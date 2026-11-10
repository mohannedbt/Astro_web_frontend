const axios = require('axios');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { dbRun, dbAll, dbGet, usingPostgres } = require('../middleware/database');
const { authMiddleware } = require('../middleware/auth');
const { sanitizeRun, GAME_LIMITS, DIFFICULTIES } = require('../services/astrogamesScoring');

const ASTRO_KEYWORDS = [
  'planet', 'star', 'moon', 'sun', 'solar', 'galaxy', 'universe', 'astronom',
  'space', 'orbit', 'comet', 'asteroid', 'nebula', 'black hole', 'mars',
  'venus', 'jupiter', 'saturn', 'mercury', 'neptune', 'uranus', 'pluto',
  'cosmic', 'telescope', 'nasa', 'spacecraft', 'satellite', 'meteor',
  'eclipse', 'constellation', 'milky way', 'astronaut', 'rocket',
];

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

const BACKEND_QUIZ_BANK = {
  easy: [
    { question: 'Which planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Mercury', 'Jupiter'], answer: 'Mars' },
    { question: 'What is the closest star to Earth?', options: ['The Sun', 'Sirius', 'Proxima Centauri', 'Alpha Centauri'], answer: 'The Sun' },
    { question: 'How many planets are in our solar system?', options: ['8', '7', '9', '10'], answer: '8' },
    { question: 'What galaxy do we live in?', options: ['The Milky Way', 'Andromeda', 'Triangulum', 'Whirlpool'], answer: 'The Milky Way' },
    { question: 'Which planet has the most prominent ring system?', options: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'], answer: 'Saturn' },
    { question: 'Which planet is the largest in our solar system?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], answer: 'Jupiter' },
    { question: "What is the name of Earth's natural satellite?", options: ['The Moon', 'Titan', 'Europa', 'Phobos'], answer: 'The Moon' },
    { question: 'What is the brightest object in the night sky after the Moon?', options: ['Venus', 'Jupiter', 'Mars', 'Sirius'], answer: 'Venus' },
    { question: 'What do we call a rocky body orbiting the Sun, mostly found between Mars and Jupiter?', options: ['Asteroid', 'Comet', 'Meteorite', 'Dwarf planet'], answer: 'Asteroid' },
    { question: 'What is a shooting star actually made of?', options: ['A meteoroid burning in the atmosphere', 'A piece of a dying star', 'A comet fragment', 'Solar debris'], answer: 'A meteoroid burning in the atmosphere' },
    { question: 'Which planet is smallest in our solar system?', options: ['Mercury', 'Mars', 'Venus', 'Earth'], answer: 'Mercury' },
    { question: 'What is the name of the force that keeps planets in orbit?', options: ['Gravity', 'Magnetism', 'Friction', 'Nuclear force'], answer: 'Gravity' },
    { question: 'What is the Sun made of mostly?', options: ['Hydrogen and Helium', 'Oxygen and Carbon', 'Iron and Nickel', 'Methane and Ammonia'], answer: 'Hydrogen and Helium' },
    { question: 'Which planet spins on its side with an extreme axial tilt?', options: ['Uranus', 'Saturn', 'Neptune', 'Jupiter'], answer: 'Uranus' },
    { question: 'What type of galaxy is the Milky Way?', options: ['Spiral', 'Elliptical', 'Irregular', 'Ring'], answer: 'Spiral' },
  ],
  medium: [
    { question: 'Which moon of Saturn has a thick nitrogen atmosphere?', options: ['Titan', 'Enceladus', 'Mimas', 'Iapetus'], answer: 'Titan' },
    { question: 'What is the term for the point in an orbit closest to the Sun?', options: ['Perihelion', 'Aphelion', 'Zenith', 'Apogee'], answer: 'Perihelion' },
    { question: 'Which spacecraft first landed humans on the Moon?', options: ['Apollo 11', 'Apollo 8', 'Gemini 4', 'Voyager 1'], answer: 'Apollo 11' },
    { question: 'Which dwarf planet was reclassified from full planet status in 2006?', options: ['Pluto', 'Ceres', 'Eris', 'Haumea'], answer: 'Pluto' },
    { question: 'What is the name of the region of space beyond Neptune filled with icy objects?', options: ['Kuiper Belt', 'Oort Cloud', 'Asteroid Belt', 'Heliosphere'], answer: 'Kuiper Belt' },
    { question: 'Which planet has the Great Red Spot?', options: ['Jupiter', 'Mars', 'Saturn', 'Neptune'], answer: 'Jupiter' },
    { question: 'What is the surface temperature of the Sun approximately?', options: ['5,500°C', '1,000°C', '10,000°C', '50,000°C'], answer: '5,500°C' },
    { question: "What is the name of Mars's largest volcano?", options: ['Olympus Mons', 'Mauna Loa', 'Tharsis', 'Elysium Mons'], answer: 'Olympus Mons' },
    { question: 'Which moon of Jupiter is thought to have a subsurface ocean?', options: ['Europa', 'Io', 'Callisto', 'Ganymede'], answer: 'Europa' },
    { question: 'What is the term for a cloud of gas and dust in space where new stars form?', options: ['Nebula', 'Quasar', 'Pulsar', 'Nova'], answer: 'Nebula' },
    { question: 'How long does light from the Sun take to reach Earth?', options: ['About 8 minutes', 'About 8 seconds', 'About 8 hours', 'About 8 days'], answer: 'About 8 minutes' },
    { question: 'What is the name of the first artificial satellite launched into orbit?', options: ['Sputnik 1', 'Explorer 1', 'Vostok 1', 'Luna 1'], answer: 'Sputnik 1' },
    { question: 'Which telescope was launched into orbit in 1990 and revolutionized astronomy?', options: ['Hubble Space Telescope', 'James Webb Telescope', 'Chandra X-ray', 'Spitzer Space Telescope'], answer: 'Hubble Space Telescope' },
    { question: 'What phenomenon occurs when the Moon passes between Earth and the Sun?', options: ['Solar eclipse', 'Lunar eclipse', 'Transit', 'Occultation'], answer: 'Solar eclipse' },
    { question: 'What is the Asteroid Belt mostly composed of?', options: ['Rocky debris from the early solar system', 'Ice and frozen gases', 'Iron meteorites', 'Cometary dust'], answer: 'Rocky debris from the early solar system' },
  ],
  hard: [
    { question: 'What is the Chandrasekhar limit approximately equal to, in solar masses?', options: ['1.4', '3.2', '0.8', '5.6'], answer: '1.4' },
    { question: 'Which region of the solar system is the source of most long-period comets?', options: ['The Oort Cloud', 'The Kuiper Belt', 'The Asteroid Belt', 'The Heliosphere'], answer: 'The Oort Cloud' },
    { question: "What is a star's total energy output per second called?", options: ['Luminosity', 'Magnitude', 'Flux density', 'Albedo'], answer: 'Luminosity' },
    { question: 'Which mission was the first to achieve a soft landing on a comet?', options: ['Rosetta/Philae', 'Stardust', 'Deep Impact', 'OSIRIS-REx'], answer: 'Rosetta/Philae' },
    { question: 'What is the name of the process by which stars fuse hydrogen into helium?', options: ['Nuclear fusion', 'Nuclear fission', 'Photodissociation', 'Radioactive decay'], answer: 'Nuclear fusion' },
    { question: 'What type of object forms when a massive star collapses after a supernova?', options: ['Neutron star or black hole', 'White dwarf', 'Red giant', 'Planetary nebula'], answer: 'Neutron star or black hole' },
    { question: "What is the Hertzsprung-Russell diagram used to classify?", options: ['Stars by luminosity and temperature', 'Galaxies by size', 'Planets by mass', 'Nebulae by composition'], answer: 'Stars by luminosity and temperature' },
    { question: "What does the term 'redshift' indicate about a galaxy?", options: ['It is moving away from us', 'It is moving toward us', 'It is spinning faster', 'It contains more red stars'], answer: 'It is moving away from us' },
    { question: 'Which planet has the fastest rotation in the solar system?', options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'], answer: 'Jupiter' },
    { question: 'What is the primary composition of a comet nucleus?', options: ['Ice, dust, and rocky material', 'Iron and silicate rock', 'Liquid hydrogen', 'Carbon dioxide only'], answer: 'Ice, dust, and rocky material' },
    { question: "What force counteracts gravity inside a main-sequence star?", options: ['Radiation pressure from nuclear fusion', 'Magnetic force', 'Centrifugal force', 'Electromagnetic repulsion'], answer: 'Radiation pressure from nuclear fusion' },
    { question: "What is the name of the first exoplanet confirmed around a sun-like star?", options: ['51 Pegasi b', 'Kepler-22b', 'HD 209458 b', 'Tau Boötis b'], answer: '51 Pegasi b' },
    { question: "Which telescope is designed specifically to detect gravitational waves?", options: ['LIGO', 'Hubble', 'Chandra', 'James Webb'], answer: 'LIGO' },
    { question: "What is the 'habitable zone' of a star also known as?", options: ['The Goldilocks Zone', 'The Life Belt', 'The Frost Line', 'The Roche Zone'], answer: 'The Goldilocks Zone' },
    { question: "What element was first discovered in the Sun's spectrum before being found on Earth?", options: ['Helium', 'Hydrogen', 'Neon', 'Carbon'], answer: 'Helium' },
  ],
  insane: [
    { question: 'What is the approximate mass of the supermassive black hole Sagittarius A*?', options: ['About 4.3 million solar masses', 'About 4.3 thousand', 'About 4.3 billion', 'About 430'], answer: 'About 4.3 million solar masses' },
    { question: 'Which spacecraft became the first human-made object to enter interstellar space?', options: ['Voyager 1', 'Voyager 2', 'Pioneer 10', 'New Horizons'], answer: 'Voyager 1' },
    { question: 'What is the Roche limit primarily used to calculate?', options: ['The distance at which a celestial body disintegrates due to tidal forces', 'The escape velocity of a planet', 'The habitable zone of a star', 'The rotation period of a moon'], answer: 'The distance at which a celestial body disintegrates due to tidal forces' },
    { question: "What is the term for the faint glow of sunlight scattered by interplanetary dust?", options: ['Zodiacal light', 'Airglow', 'Gegenschein halo', 'Corona discharge'], answer: 'Zodiacal light' },
    { question: "Mercury's orbital perihelion shift is explained by which theory?", options: ["General Relativity", "Special Relativity", "Newtonian Mechanics", "Quantum Gravity"], answer: "General Relativity" },
    { question: "What physical phenomenon causes pulsars to emit regular radio pulses?", options: ["Rapid rotation with a strong magnetic field", "Nuclear oscillation in the core", "Binary star interaction", "Accretion disk turbulence"], answer: "Rapid rotation with a strong magnetic field" },
    { question: "What is the Schwarzschild radius of an object?", options: ["The radius at which it becomes a black hole", "Its equatorial circumference", "Its Roche limit distance", "Its event horizon temperature"], answer: "The radius at which it becomes a black hole" },
    { question: "Which type of supernova occurs when a white dwarf in a binary system accretes enough mass?", options: ["Type Ia", "Type II", "Type Ib", "Type Ic"], answer: "Type Ia" },
    { question: "What is the Jeans instability condition related to?", options: ["When a gas cloud collapses under gravity to form a star", "When a star explodes as a supernova", "When two galaxies merge", "When a neutron star becomes a pulsar"], answer: "When a gas cloud collapses under gravity to form a star" },
    { question: "What is the cosmic microwave background radiation a remnant of?", options: ["The Big Bang", "The first supernova explosion", "Quasar formation", "The first galaxy merger"], answer: "The Big Bang" },
    { question: "What is the approximate age of the universe?", options: ["13.8 billion years", "4.5 billion years", "100 billion years", "1 trillion years"], answer: "13.8 billion years" },
    { question: "Which telescope was launched in 2021 and observes in near-infrared?", options: ["James Webb Space Telescope", "Hubble Space Telescope", "Chandra X-ray Observatory", "TESS"], answer: "James Webb Space Telescope" },
    { question: "What is the name of the process that converts four hydrogen nuclei into one helium nucleus inside stars?", options: ["Proton-proton chain", "CNO cycle", "Triple-alpha process", "Fission chain"], answer: "Proton-proton chain" },
    { question: "Which moon of Neptune has a retrograde orbit, suggesting it was captured?", options: ["Triton", "Proteus", "Nereid", "Despina"], answer: "Triton" },
    { question: "What is dark energy thought to be responsible for?", options: ["The accelerating expansion of the universe", "Galaxy formation", "Black hole growth", "Pulsar emissions"], answer: "The accelerating expansion of the universe" },
  ],
};

// OpenTDB allows roughly one request per 5 seconds per IP, and we were asking it
// for 50 questions on every page load. Cache the filtered pool per difficulty.
const LIVE_POOL_TTL_MS = 10 * 60 * 1000;
const livePoolCache = new Map();

async function loadLivePool(apiDifficulty) {
  const cached = livePoolCache.get(apiDifficulty);
  if (cached && Date.now() - cached.at < LIVE_POOL_TTL_MS) return cached.pool;

  const response = await axios.get('https://opentdb.com/api.php', {
    params: { amount: 50, category: 17, difficulty: apiDifficulty, type: 'multiple' },
    timeout: 8000,
  });
  const payload = response.data;
  if (payload.response_code !== 0 || !Array.isArray(payload.results) || !payload.results.length) {
    throw new Error('No live questions returned');
  }

  // Keep only questions that are clearly astronomy/space related, de-duplicated.
  const seen = new Set();
  const pool = [];
  for (const item of payload.results) {
    const question = decodeHtmlEntities(item.question);
    if (seen.has(question)) continue;
    if (!ASTRO_KEYWORDS.some((keyword) => question.toLowerCase().includes(keyword))) continue;
    seen.add(question);
    pool.push({
      question,
      answer: decodeHtmlEntities(item.correct_answer),
      options: shuffleArray([item.correct_answer, ...item.incorrect_answers].map(decodeHtmlEntities)),
      category: decodeHtmlEntities(item.category),
    });
  }
  livePoolCache.set(apiDifficulty, { at: Date.now(), pool });
  return pool;
}

async function fetchLiveAstronomyQuestions(difficultyTier = 'medium', amount = 5) {
  const apiDifficulty = difficultyTier === 'insane' ? 'hard' : difficultyTier;
  const fallbackPool = BACKEND_QUIZ_BANK[difficultyTier] || BACKEND_QUIZ_BANK.easy;
  try {
    const live = shuffleArray(await loadLivePool(apiDifficulty)).slice(0, amount);
    if (live.length >= amount) return live;

    // Not enough live questions: top up from the curated local bank.
    const seen = new Set(live.map((entry) => entry.question));
    for (const entry of shuffleArray(fallbackPool)) {
      if (live.length >= amount) break;
      if (!seen.has(entry.question)) live.push(entry);
    }
    return live;
  } catch (error) {
    logger.warn('Live questions unavailable, using curated bank', { message: error.message });
    return shuffleArray(fallbackPool).slice(0, amount);
  }
}

// ---------------------------------------------------------------------------
// Leaderboard helpers
// ---------------------------------------------------------------------------

const LEADERBOARD_LIMIT = 100;

// Monday 00:00 UTC of the current week.
function startOfWeekIso(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start.toISOString();
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// Postgres returns SUM()/COUNT() as strings (bigint); normalise to numbers.
const num = (value) => Number(value) || 0;

async function totalXpForUser(userId) {
  const runs = await dbGet('SELECT COALESCE(SUM(xp), 0) AS xp, COUNT(*) AS games FROM astrogames_scores WHERE user_id = ?', [userId]);
  const bonus = await dbGet('SELECT COALESCE(SUM(xp), 0) AS xp FROM astrogames_xp_events WHERE user_id = ?', [userId]);
  return { xp: num(runs?.xp) + num(bonus?.xp), gamesPlayed: num(runs?.games) };
}

async function globalLeaderboard({ timeframe, difficulty }) {
  const runFilters = ['user_id IS NOT NULL'];
  const runParams = [];
  const bonusFilters = [];
  const bonusParams = [];
  if (timeframe === 'weekly') {
    const since = startOfWeekIso();
    runFilters.push('created_at >= ?');
    runParams.push(since);
    bonusFilters.push('created_at >= ?');
    bonusParams.push(since);
  }
  if (difficulty) {
    runFilters.push('difficulty = ?');
    runParams.push(difficulty);
  }
  // Login bonuses have no difficulty, so they only count when it isn't filtered.
  const bonusSql = difficulty
    ? ''
    : `UNION ALL SELECT user_id, NULL AS user_name, xp, 0 AS score, 0 AS games, created_at FROM astrogames_xp_events ${bonusFilters.length ? `WHERE ${bonusFilters.join(' AND ')}` : ''}`;

  const rows = await dbAll(
    `SELECT user_id, MAX(user_name) AS user_name, SUM(xp) AS xp, SUM(score) AS score, SUM(games) AS games_played, MAX(created_at) AS created_at
     FROM (
       SELECT user_id, user_name, xp, score, 1 AS games, created_at FROM astrogames_scores WHERE ${runFilters.join(' AND ')}
       ${bonusSql}
     ) AS combined
     GROUP BY user_id
     ORDER BY SUM(xp) DESC
     LIMIT ${LEADERBOARD_LIMIT}`,
    [...runParams, ...(difficulty ? [] : bonusParams)]
  );

  // Emails are intentionally not returned: this endpoint is public.
  return rows.map((row) => ({
    id: `user-${row.user_id}`,
    userId: row.user_id,
    name: row.user_name || 'Cadet Pilot',
    xp: num(row.xp),
    score: num(row.score),
    gamesPlayed: num(row.games_played),
    created_at: row.created_at,
  }));
}

async function gameLeaderboard({ game, timeframe, difficulty }) {
  const filters = [];
  const params = [];
  if (game) {
    filters.push('game = ?');
    params.push(game);
  }
  if (difficulty) {
    filters.push('difficulty = ?');
    params.push(difficulty);
  }
  if (timeframe === 'weekly') {
    filters.push('created_at >= ?');
    params.push(startOfWeekIso());
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = await dbAll(
    `SELECT id, game, user_id, COALESCE(user_name, name) AS name, score, xp, total, difficulty, won, guesses, time_sec, pct, created_at
     FROM astrogames_scores ${where}
     ORDER BY score DESC, created_at ASC
     LIMIT ${LEADERBOARD_LIMIT}`,
    params
  );
  return rows.map((row) => ({ ...row, won: Boolean(row.won) }));
}

async function insertRun(userId, user, run) {
  const columns = 'game, name, score, xp, total, difficulty, won, guesses, time_sec, pct, user_id, user_email, user_name, client_run_id, created_at';
  const displayName = String(user.username || user.name || user.email || 'Cadet Pilot').slice(0, 120);
  const values = [
    run.game,
    displayName,
    run.score,
    run.xp,
    run.total,
    run.difficulty,
    usingPostgres ? run.won : (run.won ? 1 : 0),
    run.guesses,
    run.timeSec,
    run.pct,
    userId,
    user.email || null,
    displayName,
    run.clientRunId,
    new Date().toISOString(),
  ];
  const placeholders = values.map(() => '?').join(', ');
  // ON CONFLICT DO NOTHING + the (user_id, client_run_id) unique index = a
  // retried request returns the original row instead of adding a second one.
  const result = await dbRun(
    `INSERT INTO astrogames_scores (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING${usingPostgres ? ' RETURNING id' : ''}`,
    values
  );
  const insertedId = usingPostgres ? result.rows?.[0]?.id : (result.changes ? result.lastInsertRowid : null);
  if (insertedId) {
    return { id: insertedId, duplicate: false };
  }
  const existing = await dbGet('SELECT id FROM astrogames_scores WHERE user_id = ? AND client_run_id = ?', [userId, run.clientRunId]);
  return { id: existing?.id, duplicate: true };
}

function astrogamesRoutes(app) {
  // A human can't finish more than a handful of runs a minute; this caps abuse
  // without affecting normal play. Keyed by user (falls back to IP).
  const submitLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => (req.user ? `user-${req.user.id}` : req.ip),
    message: { error: 'Too many score submissions, please slow down' },
  });

  app.get('/api/astrogames/live-questions', async (req, res) => {
    try {
      const requested = String(req.query.difficulty || 'medium').toLowerCase();
      const difficulty = DIFFICULTIES.includes(requested) ? requested : 'medium';
      const amount = Math.min(20, Math.max(1, Math.round(Number(req.query.amount)) || 5));
      const questions = await fetchLiveAstronomyQuestions(difficulty, amount);
      if (!questions.length) return res.status(502).json({ error: 'Unable to fetch astronomy questions' });
      res.json({ questions });
    } catch (error) {
      logger.error('live-questions failed', { message: error.message });
      res.status(500).json({ error: 'Unable to fetch astronomy questions' });
    }
  });

  // Public leaderboard. game=global aggregates XP per player in SQL; any other
  // game name returns the best individual runs for that game.
  app.get('/api/astrogames/leaderboard', async (req, res) => {
    try {
      const game = String(req.query.game || '').trim().slice(0, 60);
      const timeframe = req.query.timeframe === 'weekly' ? 'weekly' : 'all';
      const difficultyParam = String(req.query.difficulty || '').toLowerCase();
      const difficulty = DIFFICULTIES.includes(difficultyParam) ? difficultyParam : '';

      if (game && game !== 'global' && !GAME_LIMITS[game]) {
        return res.status(400).json({ error: 'Unknown game' });
      }
      const rows = game === 'global'
        ? await globalLeaderboard({ timeframe, difficulty })
        : await gameLeaderboard({ game, timeframe, difficulty });
      res.json(rows);
    } catch (error) {
      logger.error('Leaderboard unavailable', { message: error.message, stack: error.stack });
      res.status(500).json({ error: 'Leaderboard unavailable' });
    }
  });

  // Save a finished run. Identity comes from the verified token, never from the
  // request body, so a player can't submit scores as someone else.
  app.post('/api/astrogames/leaderboard', authMiddleware, submitLimiter, async (req, res) => {
    const { run, error } = sanitizeRun(req.body);
    if (error) return res.status(400).json({ error });

    try {
      const userId = Number(req.user.id);
      const { id, duplicate } = await insertRun(userId, req.user, run);
      const totals = await totalXpForUser(userId);
      res.status(duplicate ? 200 : 201).json({ id, duplicate, xpEarned: duplicate ? 0 : run.xp, totalXp: totals.xp, gamesPlayed: totals.gamesPlayed });
    } catch (e) {
      logger.error('Unable to save leaderboard entry', { message: e.message, stack: e.stack, game: run.game, userId: req.user.id });
      res.status(500).json({ error: 'Unable to save leaderboard entry' });
    }
  });

  // The signed-in player's authoritative XP total (replaces the localStorage tally).
  app.get('/api/astrogames/me', authMiddleware, async (req, res) => {
    try {
      const totals = await totalXpForUser(Number(req.user.id));
      const claimedToday = await dbGet('SELECT id FROM astrogames_xp_events WHERE user_id = ? AND kind = ? AND day = ?', [Number(req.user.id), 'daily-login', todayUtc()]);
      res.json({ ...totals, dailyClaimed: Boolean(claimedToday) });
    } catch (e) {
      logger.error('Unable to load player stats', { message: e.message, userId: req.user.id });
      res.status(500).json({ error: 'Unable to load player stats' });
    }
  });

  // Daily login reward: once per UTC day, enforced by a unique index.
  app.post('/api/astrogames/daily-claim', authMiddleware, async (req, res) => {
    const DAILY_XP = 100;
    try {
      const userId = Number(req.user.id);
      const result = await dbRun(
        'INSERT INTO astrogames_xp_events (user_id, kind, day, xp, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING',
        [userId, 'daily-login', todayUtc(), DAILY_XP, new Date().toISOString()]
      );
      const claimed = usingPostgres ? result.rowCount > 0 : result.changes > 0;
      const totals = await totalXpForUser(userId);
      res.json({
        claimed,
        xp: claimed ? DAILY_XP : 0,
        totalXp: totals.xp,
        message: claimed ? 'Daily Login Reward Claimed: +100 XP!' : 'Daily 100 XP already claimed today!',
      });
    } catch (e) {
      logger.error('Daily claim failed', { message: e.message, userId: req.user.id });
      res.status(500).json({ error: 'Unable to claim daily XP' });
    }
  });
}

module.exports = { astrogamesRoutes, startOfWeekIso };
