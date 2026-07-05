const bcrypt = require('bcryptjs');
const { dbGet, dbRun, usingPostgres } = require('../middleware/database');
const { signToken, authMiddleware } = require('../middleware/auth');

function authRoutes(app) {
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, is_admin, name, username, bio, location } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const hash = await bcrypt.hash(password, 10);
    const avatarSeed = username || email;

    try {
      if (usingPostgres) {
        const result = await dbRun(
          'INSERT INTO users (email, password_hash, name, username, bio, location, avatar_seed, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, name, username, bio, location, avatar_seed, is_admin',
          [email, hash, name || '', username || '', bio || '', location || '', avatarSeed, !!is_admin]
        );
        const user = result.rows?.[0];
        return res.json({ token: signToken(user), user });
      }

      const info = await dbRun(
        'INSERT INTO users (email, password_hash, name, username, bio, location, avatar_seed, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [email, hash, name || '', username || '', bio || '', location || '', avatarSeed, is_admin ? 1 : 0]
      );
      const user = await dbGet('SELECT id, email, name, username, bio, location, avatar_seed, is_admin FROM users WHERE id = ?', [info.lastInsertRowid]);
      return res.json({ token: signToken(user), user });
    } catch (e) {
      console.error('register error', e.message || e);
      return res.status(400).json({ error: e.message && e.message.includes('unique') ? 'Email or username already exists' : 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    try {
      const row = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (!row) return res.status(400).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, row.password_hash);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

      const user = {
        id: row.id,
        email: row.email,
        name: row.name || '',
        username: row.username || '',
        avatar_seed: row.avatar_seed || '',
        is_admin: !!row.is_admin,
      };

      return res.json({ token: signToken(user), user });
    } catch (e) {
      console.error('login error', e.message || e);
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.get('/api/auth/me', authMiddleware, async (req, res) => {
    res.json({ user: req.user });
  });
}

module.exports = { authRoutes };