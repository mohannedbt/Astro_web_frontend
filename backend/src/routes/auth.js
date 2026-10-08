const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { dbGet, dbRun, usingPostgres } = require('../middleware/database');
const { signToken, authMiddleware } = require('../middleware/auth');

function authRoutes(app) {
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, is_admin, name, username, bio, location } = req.body;
    if (!email || !username || !password) return res.status(400).json({ error: 'email, username, and password required' });
    if (is_admin) return res.status(403).json({ error: 'Admin registration is disabled. Use the seeded admin account.' });

    const hash = await bcrypt.hash(password, 10);
    const avatarSeed = `${username.toString().trim()}-${Math.random().toString(36).slice(2, 10)}`;

    try {
      if (usingPostgres) {
        const result = await dbRun(
          'INSERT INTO users (email, password_hash, name, username, bio, location, avatar_seed, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name, username, bio, location, avatar_seed, is_admin',
          [email, hash, name || username, username.trim(), bio || '', location || '', avatarSeed, false]
        );
        const user = result.rows?.[0];
        return res.json({ token: signToken(user), user });
      }

      const info = await dbRun(
        'INSERT INTO users (email, password_hash, name, username, bio, location, avatar_seed, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [email, hash, name || username, username.trim(), bio || '', location || '', avatarSeed, 0]
      );
      const user = await dbGet('SELECT id, email, name, username, bio, location, avatar_seed, is_admin FROM users WHERE id = ?', [info.lastInsertRowid]);
      return res.json({ token: signToken(user), user });
    } catch (e) {
      logger.error('Registration failed', { message: e.message, stack: e.stack, email });
      return res.status(400).json({ error: e.message && e.message.includes('unique') ? 'Email or username already exists' : 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    try {
      const row = await dbGet('SELECT * FROM users WHERE email = ?', [email.trim()]);
      if (!row) {
        logger.warn('Login failed: no user found', { email });
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const ok = await bcrypt.compare(password, row.password_hash);
      if (!ok) {
        logger.warn('Login failed: bad password', { email });
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
      logger.error('Login failed', { message: e.message, stack: e.stack, email });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.get('/api/auth/me', authMiddleware, async (req, res) => {
    res.json({ user: req.user });
  });

  app.patch('/api/auth/profile', authMiddleware, async (req, res) => {
    const { email, name, username, bio, location } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    try {
      const nextUsername = username === undefined ? req.user.username : String(username).trim();
      if (!nextUsername) return res.status(400).json({ error: 'Username is required' });
      await dbRun(
        'UPDATE users SET email = ?, name = ?, username = ?, bio = ?, location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [email, name || nextUsername, nextUsername, bio || '', location || '', req.user.id]
      );
      const user = await dbGet('SELECT id, email, name, username, bio, location, avatar_seed, is_admin FROM users WHERE id = ?', [req.user.id]);
      return res.json({ user, token: signToken(user) });
    } catch (e) {
      logger.error('Profile update failed', { message: e.message, stack: e.stack, userId: req.user.id });
      return res.status(400).json({ error: e.message && e.message.includes('unique') ? 'Email or username already exists' : 'Profile update failed' });
    }
  });
}

module.exports = { authRoutes };