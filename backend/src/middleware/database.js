const path = require('path');
const { Pool } = require('pg');
const Database = require('better-sqlite3');

const DATABASE_URL = process.env.DATABASE_URL;
const usingPostgres = Boolean(DATABASE_URL);

let pgPool = null;
let db = null;

function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function initDatabase() {
  if (usingPostgres) {
    pgPool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

    await pgPool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      username TEXT UNIQUE,
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      avatar_seed TEXT DEFAULT '',
      is_admin BOOLEAN DEFAULT false,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pgPool.query(`CREATE TABLE IF NOT EXISTS workshops (
      id SERIAL PRIMARY KEY,
      title TEXT,
      summary TEXT,
      description TEXT,
      date TEXT,
      time TEXT,
      duration TEXT,
      location TEXT,
      host TEXT,
      topic TEXT,
      status TEXT,
      level TEXT,
      capacity INTEGER DEFAULT 0,
      registered_count INTEGER DEFAULT 0,
      presentation_link TEXT,
      prerequisites TEXT,
      agenda TEXT
    )`);

    await pgPool.query(`CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      source_id TEXT,
      title TEXT,
      start_time TEXT,
      description TEXT,
      location TEXT,
      time TEXT,
      status TEXT,
      capacity INTEGER DEFAULT 0
    )`);

    await pgPool.query(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      subscribed_at TEXT
    )`);

    await pgPool.query(`CREATE TABLE IF NOT EXISTS newsletter_template (
      id SERIAL PRIMARY KEY,
      template_key TEXT UNIQUE,
      subject TEXT,
      body TEXT
    )`);

    await pgPool.query(`ALTER TABLE newsletter_template ADD COLUMN IF NOT EXISTS template_key TEXT`);
    await pgPool.query(`ALTER TABLE newsletter_template ADD COLUMN IF NOT EXISTS body TEXT`);
    await pgPool.query(`CREATE UNIQUE INDEX IF NOT EXISTS newsletter_template_key_unique ON newsletter_template (template_key)`);

    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS summary TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS time TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS duration TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS host TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS topic TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS status TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS level TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS registered_count INTEGER DEFAULT 0`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS presentation_link TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS prerequisites TEXT`);
    await pgPool.query(`ALTER TABLE workshops ADD COLUMN IF NOT EXISTS agenda TEXT`);

    await pgPool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT`);
    await pgPool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS time TEXT`);
    await pgPool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT`);
    await pgPool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0`);

    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT DEFAULT ''`);
    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE`);
    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT ''`);
    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT DEFAULT ''`);
    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_seed TEXT DEFAULT ''`);
    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  } else {
    const dbPath = path.join(__dirname, '../../data.db');
    db = new Database(dbPath);

    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      username TEXT UNIQUE,
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      avatar_seed TEXT DEFAULT '',
      is_admin INTEGER DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS workshops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      summary TEXT,
      description TEXT,
      date TEXT,
      time TEXT,
      duration TEXT,
      location TEXT,
      host TEXT,
      topic TEXT,
      status TEXT,
      level TEXT,
      capacity INTEGER DEFAULT 0,
      registered_count INTEGER DEFAULT 0,
      presentation_link TEXT,
      prerequisites TEXT,
      agenda TEXT
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT,
      title TEXT,
      start_time TEXT,
      description TEXT,
      location TEXT,
      time TEXT,
      status TEXT,
      capacity INTEGER DEFAULT 0
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      subscribed_at TEXT
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_key TEXT UNIQUE,
      subject TEXT,
      body TEXT
    )`).run();

    const existingTemplateColumns = db.prepare('PRAGMA table_info(newsletter_template)').all().map((row) => row.name);
    const ensureTemplateColumn = (name, def) => {
      if (!existingTemplateColumns.includes(name)) {
        db.prepare(`ALTER TABLE newsletter_template ADD COLUMN ${name} ${def}`).run();
      }
    };

    ensureTemplateColumn('template_key', 'TEXT');
    ensureTemplateColumn('body', 'TEXT');
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS newsletter_template_key_unique ON newsletter_template (template_key)').run();

    const existingWorkshopColumns = db.prepare('PRAGMA table_info(workshops)').all().map((row) => row.name);
    const ensureColumn = (name, def) => {
      if (!existingWorkshopColumns.includes(name)) {
        db.prepare(`ALTER TABLE workshops ADD COLUMN ${name} ${def}`).run();
      }
    };

    ensureColumn('summary', 'TEXT');
    ensureColumn('time', 'TEXT');
    ensureColumn('duration', 'TEXT');
    ensureColumn('host', 'TEXT');
    ensureColumn('topic', 'TEXT');
    ensureColumn('status', 'TEXT');
    ensureColumn('level', 'TEXT');
    ensureColumn('capacity', 'INTEGER DEFAULT 0');
    ensureColumn('registered_count', 'INTEGER DEFAULT 0');
    ensureColumn('presentation_link', 'TEXT');
    ensureColumn('prerequisites', 'TEXT');
    ensureColumn('agenda', 'TEXT');

    db.prepare(`ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT`).run();
    db.prepare(`ALTER TABLE events ADD COLUMN IF NOT EXISTS time TEXT`).run();
    db.prepare(`ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT`).run();
    db.prepare(`ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0`).run();

    const existingUserColumns = db.prepare('PRAGMA table_info(users)').all().map((row) => row.name);
    const ensureUserColumn = (name, def) => {
      if (!existingUserColumns.includes(name)) {
        db.prepare(`ALTER TABLE users ADD COLUMN ${name} ${def}`).run();
      }
    };

    ensureUserColumn('name', "TEXT DEFAULT ''");
    ensureUserColumn('username', 'TEXT UNIQUE');
    ensureUserColumn('bio', "TEXT DEFAULT ''");
    ensureUserColumn('location', "TEXT DEFAULT ''");
    ensureUserColumn('avatar_seed', "TEXT DEFAULT ''");
    ensureUserColumn('joined_at', "DATETIME DEFAULT CURRENT_TIMESTAMP");
    ensureUserColumn('updated_at', "DATETIME DEFAULT CURRENT_TIMESTAMP");
  }
}

async function dbAll(sql, params = []) {
  if (usingPostgres) {
    const result = await pgPool.query(convertPlaceholders(sql), params);
    return result.rows;
  }
  return db.prepare(sql).all(...params);
}

async function dbGet(sql, params = []) {
  if (usingPostgres) {
    const result = await pgPool.query(convertPlaceholders(sql), params);
    return result.rows[0];
  }
  return db.prepare(sql).get(...params);
}

async function dbRun(sql, params = []) {
  if (usingPostgres) {
    return pgPool.query(convertPlaceholders(sql), params);
  }
  return db.prepare(sql).run(...params);
}

module.exports = {
  initDatabase,
  dbAll,
  dbGet,
  dbRun,
  usingPostgres,
};