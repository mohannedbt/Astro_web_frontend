require('dotenv').config();
const bcrypt = require('bcryptjs');
let Database = null;
const { Pool } = require('pg');

const email = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const password = process.env.ADMIN_PASS || 'adminpass';

async function seedSqlite() {
  if (process.env.DATABASE_URL) {
    return;
  }

  Database = require('better-sqlite3');
  const db = new Database(__dirname + '/data.db');
  try {
    // Create tables first
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT DEFAULT '',
      username TEXT UNIQUE,
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      avatar_seed TEXT DEFAULT '',
      is_admin INTEGER DEFAULT 0,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();
    
    const hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (email, password_hash, name, username, avatar_seed, is_admin) VALUES (?, ?, ?, ?, ?, ?)').run(email, hash, 'Admin User', 'admin', email, 1);
    console.log('✓ Admin user created (sqlite):', email);
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
      console.log('✓ Admin user already exists (sqlite):', email);
    } else {
      console.error('Error creating admin (sqlite):', e.message);
    }
  }
}

async function seedPg() {
  if (!process.env.DATABASE_URL) {
    return;
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    // Create tables first
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT DEFAULT '',
      username TEXT UNIQUE,
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      avatar_seed TEXT DEFAULT '',
      is_admin BOOLEAN DEFAULT false,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password_hash, name, username, avatar_seed, is_admin) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING', [email, hash, 'Admin User', 'admin', email, true]);
    console.log('✓ Admin user created (postgres):', email);
  } catch (e) {
    if (e.message.includes('unique constraint') || e.message.includes('already exists')) {
      console.log('✓ Admin user already exists (postgres):', email);
    } else {
      console.error('Error creating admin (postgres):', e.message);
    }
  } finally {
    await pool.end();
  }
}

(async () => {
  await seedSqlite();
  await seedPg();
})();
