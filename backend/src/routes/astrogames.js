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

async function ensureQuizResultTables() {
  const highScoresSql = usingPostgres
    ? `CREATE TABLE IF NOT EXISTS astrogames_high_scores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        correct INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL DEFAULT 5,
        user_id INTEGER DEFAULT NULL,
        user_email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS astrogames_high_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        correct INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL DEFAULT 5,
        user_id INTEGER DEFAULT NULL,
        user_email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;
  const winnersSql = usingPostgres
    ? `CREATE TABLE IF NOT EXISTS astrogames_winners (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 375,
        correct INTEGER NOT NULL DEFAULT 5,
        total INTEGER NOT NULL DEFAULT 5,
        user_id INTEGER DEFAULT NULL,
        user_email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    : `CREATE TABLE IF NOT EXISTS astrogames_winners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL DEFAULT 375,
        correct INTEGER NOT NULL DEFAULT 5,
        total INTEGER NOT NULL DEFAULT 5,
        user_id INTEGER DEFAULT NULL,
        user_email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;
  await dbRun(highScoresSql);
  await dbRun(winnersSql);
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

    // Strictly filter to ensure 100% astronomy/space-focused
    const astronomyMatches = decoded.filter((entry) => ASTRO_KEYWORDS.some((keyword) => entry.question.toLowerCase().includes(keyword)));
    const seen = new Set();
    const unique = [];
    for (const entry of astronomyMatches) {
      if (seen.has(entry.question)) continue;
      seen.add(entry.question);
      unique.push(entry);
      if (unique.length >= amount) break;
    }

    // If we don't have enough 100% astronomy questions, fall back to our local curated pool
    if (unique.length < amount) {
      const fallbackPool = BACKEND_QUIZ_BANK[difficultyTier] || BACKEND_QUIZ_BANK.easy;
      const shuffledFallback = shuffleArray(fallbackPool);
      for (const entry of shuffledFallback) {
        if (!seen.has(entry.question)) {
          seen.add(entry.question);
          unique.push(entry);
          if (unique.length >= amount) break;
        }
      }
    }

    return unique;
  } catch (error) {
    // If API fails entirely, fall back to our high quality curated astronomy questions
    const fallbackPool = BACKEND_QUIZ_BANK[difficultyTier] || BACKEND_QUIZ_BANK.easy;
    return shuffleArray(fallbackPool).slice(0, amount);
  }
}

function astrogamesRoutes(app) {
  app.get('/api/astrogames/quiz-results', async (req, res) => {
    try {
      await ensureQuizResultTables();
      const scores = await dbAll('SELECT * FROM astrogames_high_scores ORDER BY score DESC, created_at ASC LIMIT 20');
      const winners = await dbAll('SELECT * FROM astrogames_winners ORDER BY created_at DESC LIMIT 20');
      res.json({ scores, winners });
    } catch (error) {
      logger.error('Unable to load quiz results', { message: error.message, stack: error.stack });
      res.status(500).json({ error: 'Quiz results unavailable' });
    }
  });

  app.post('/api/astrogames/quiz-results', async (req, res) => {
    const { name, score, total, correct, userId, userEmail } = req.body;
    const safeName = String(name || '').trim().slice(0, 120);
    const safeScore = Math.max(0, Math.min(375, Number(score) || 0));
    const safeTotal = 5;
    const safeCorrect = Math.max(0, Math.min(safeTotal, Number(correct) || 0));
    if (!safeName) return res.status(400).json({ error: 'name required' });

    try {
      await ensureQuizResultTables();
      const values = [safeName, safeScore, safeCorrect, safeTotal, userId || null, userEmail || null, new Date().toISOString()];
      const scoreSql = usingPostgres
        ? 'INSERT INTO astrogames_high_scores (name, score, correct, total, user_id, user_email, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
        : 'INSERT INTO astrogames_high_scores (name, score, correct, total, user_id, user_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
      let savedScore;
      if (usingPostgres) {
        const result = await dbRun(scoreSql, values);
        savedScore = result.rows?.[0];
      } else {
        await dbRun(scoreSql, values);
        const lastId = await dbGet('SELECT last_insert_rowid() AS id');
        savedScore = await dbGet('SELECT * FROM astrogames_high_scores WHERE id = ?', [lastId?.id]);
      }

      let savedWinner = null;
      if (safeCorrect === safeTotal) {
        const winnerSql = usingPostgres
          ? 'INSERT INTO astrogames_winners (name, score, correct, total, user_id, user_email, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
          : 'INSERT INTO astrogames_winners (name, score, correct, total, user_id, user_email, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)';
        if (usingPostgres) {
          const result = await dbRun(winnerSql, values);
          savedWinner = result.rows?.[0];
        } else {
          await dbRun(winnerSql, values);
          const lastId = await dbGet('SELECT last_insert_rowid() AS id');
          savedWinner = await dbGet('SELECT * FROM astrogames_winners WHERE id = ?', [lastId?.id]);
        }
      }
      res.json({ score: savedScore, winner: savedWinner });
    } catch (error) {
      logger.error('Unable to save quiz result', { message: error.message, stack: error.stack, name: safeName });
      res.status(500).json({ error: 'Unable to save quiz result' });
    }
  });

  app.get('/api/astrogames/live-questions', async (req, res) => {
    try {
      const difficulty = (req.query.difficulty || 'medium').toLowerCase();
      const amount = Number(req.query.amount || 5);
      const questions = await fetchLiveAstronomyQuestions(difficulty, amount);
      if (!questions || !questions.length) {
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
