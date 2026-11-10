const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { dbGet, dbRun, usingPostgres } = require('../middleware/database');
const { signToken, authMiddleware } = require('../middleware/auth');

const BCRYPT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Permissive on purpose (existing accounts used spaces etc.); just block markup characters.
const isValidUsername = (value) => /^[^<>]{3,30}$/.test(value) && !/\p{Cc}/u.test(value);
const MIN_PASSWORD_LENGTH = 8;
// bcrypt silently ignores everything after 72 bytes, so reject longer input.
const MAX_PASSWORD_BYTES = 72;

const isUniqueViolation = (error) => /unique|duplicate/i.test(error?.message || '');
const clip = (value, max) => String(value ?? '').trim().slice(0, max);

function validateRegistration({ email, password, username }) {
  if (!EMAIL_PATTERN.test(email)) return 'A valid email address is required';
  if (!isValidUsername(username)) return 'Username must be 3-30 characters and cannot contain < or >';
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) return 'Password is too long';
  return null;
}

function authRoutes(app) {
  // Brute-force protection: failed and successful attempts both count, per IP.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later' },
  });

  app.post('/api/auth/register', authLimiter, async (req, res) => {
    const { password, is_admin } = req.body || {};
    if (is_admin) return res.status(403).json({ error: 'Admin registration is disabled. Use the seeded admin account.' });

    const email = clip(req.body?.email, 254).toLowerCase();
    const username = clip(req.body?.username, 30);
    const name = clip(req.body?.name, 120) || username;
    const bio = clip(req.body?.bio, 500);
    const location = clip(req.body?.location, 120);

    const problem = validateRegistration({ email, password, username });
    if (problem) return res.status(400).json({ error: problem });

    try {
      // The UNIQUE constraints are case-sensitive, so check case-insensitively too.
      const taken = await dbGet('SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?', [email, username.toLowerCase()]);
      if (taken) return res.status(400).json({ error: 'Email or username already exists' });

      const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const avatarSeed = `${username}-${Math.random().toString(36).slice(2, 10)}`;

      if (usingPostgres) {
        const result = await dbRun(
          'INSERT INTO users (email, password_hash, name, username, bio, location, avatar_seed, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name, username, bio, location, avatar_seed, is_admin',
          [email, hash, name, username, bio, location, avatarSeed, false]
        );
        const user = result.rows?.[0];
        return res.json({ token: signToken(user), user });
      }

      const info = await dbRun(
        'INSERT INTO users (email, password_hash, name, username, bio, location, avatar_seed, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [email, hash, name, username, bio, location, avatarSeed, 0]
      );
      const user = await dbGet('SELECT id, email, name, username, bio, location, avatar_seed, is_admin FROM users WHERE id = ?', [info.lastInsertRowid]);
      return res.json({ token: signToken(user), user });
    } catch (e) {
      logger.error('Registration failed', { message: e.message, stack: e.stack });
      if (isUniqueViolation(e)) return res.status(400).json({ error: 'Email or username already exists' });
      return res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    const email = clip(req.body?.email, 254);
    const password = req.body?.password;
    if (!email || typeof password !== 'string' || !password) return res.status(400).json({ error: 'email and password required' });

    try {
      // Case-insensitive so accounts created before emails were lowercased still work.
      const row = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
      // Same response for "no such user" and "wrong password" so the API can't
      // be used to discover which emails are registered.
      if (!row) {
        logger.warn('Login failed: no user found');
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, row.password_hash);
      if (!ok) {
        logger.warn('Login failed: bad password', { userId: row.id });
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const user = {
        id: row.id,
        email: row.email,
        name: row.name || '',
        username: row.username || '',
        bio: row.bio || '',
        location: row.location || '',
        avatar_seed: row.avatar_seed || '',
        is_admin: !!row.is_admin,
      };

      return res.json({ token: signToken(user), user });
    } catch (e) {
      logger.error('Login failed', { message: e.message, stack: e.stack });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.get('/api/auth/me', authMiddleware, async (req, res) => {
    res.json({ user: req.user });
  });

  app.patch('/api/auth/profile', authMiddleware, async (req, res) => {
    const email = clip(req.body?.email, 254).toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    const nextUsername = req.body?.username === undefined ? req.user.username : clip(req.body.username, 30);
    if (!isValidUsername(nextUsername || '')) {
      return res.status(400).json({ error: 'Username must be 3-30 characters and cannot contain < or >' });
    }
    try {
      const taken = await dbGet('SELECT id FROM users WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND id <> ?', [email, nextUsername.toLowerCase(), req.user.id]);
      if (taken) return res.status(400).json({ error: 'Email or username already exists' });

      await dbRun(
        'UPDATE users SET email = ?, name = ?, username = ?, bio = ?, location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [email, clip(req.body?.name, 120) || nextUsername, nextUsername, clip(req.body?.bio, 500), clip(req.body?.location, 120), req.user.id]
      );
      const user = await dbGet('SELECT id, email, name, username, bio, location, avatar_seed, is_admin FROM users WHERE id = ?', [req.user.id]);
      return res.json({ user, token: signToken(user) });
    } catch (e) {
      logger.error('Profile update failed', { message: e.message, stack: e.stack, userId: req.user.id });
      if (isUniqueViolation(e)) return res.status(400).json({ error: 'Email or username already exists' });
      return res.status(500).json({ error: 'Profile update failed' });
    }
  });
}

module.exports = { authRoutes, validateRegistration };
