const { dbAll, dbGet, dbRun, usingPostgres } = require('../middleware/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

function workshopRoutes(app) {
  // Public: get all workshops
  app.get('/api/workshops', async (req, res) => {
    const rows = await dbAll('SELECT * FROM workshops ORDER BY date DESC');
    res.json(rows);
  });

  // Admin: get all workshops
  app.get('/api/admin/workshops', authMiddleware, adminOnly, async (req, res) => {
    const rows = await dbAll('SELECT * FROM workshops ORDER BY date DESC');
    res.json(rows);
  });

  // Admin: create workshop
  app.post('/api/admin/workshops', authMiddleware, adminOnly, async (req, res) => {
    const {
      title, summary, description, date, time, duration, location,
      host, topic, status, level, capacity, presentation_link, prerequisites, agenda,
    } = req.body;

    const params = [title, summary, description, date, time, duration, location, host, topic, status, level, capacity, presentation_link, prerequisites, agenda];

    if (usingPostgres) {
      const result = await dbRun(
        'INSERT INTO workshops (title, summary, description, date, time, duration, location, host, topic, status, level, capacity, presentation_link, prerequisites, agenda) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
        params
      );
      return res.json(result.rows[0]);
    }

    const info = await dbRun(
      'INSERT INTO workshops (title, summary, description, date, time, duration, location, host, topic, status, level, capacity, presentation_link, prerequisites, agenda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params
    );
    const w = await dbGet('SELECT * FROM workshops WHERE id = ?', [info.lastInsertRowid]);
    res.json(w);
  });

  // Admin: update workshop
  app.put('/api/admin/workshops/:id', authMiddleware, adminOnly, async (req, res) => {
    const id = req.params.id;
    const {
      title, summary, description, date, time, duration, location,
      host, topic, status, level, capacity, presentation_link, prerequisites, agenda,
    } = req.body;

    const params = [title, summary, description, date, time, duration, location, host, topic, status, level, capacity, presentation_link, prerequisites, agenda, id];

    if (usingPostgres) {
      const result = await dbRun(
        'UPDATE workshops SET title = $1, summary = $2, description = $3, date = $4, time = $5, duration = $6, location = $7, host = $8, topic = $9, status = $10, level = $11, capacity = $12, presentation_link = $13, prerequisites = $14, agenda = $15 WHERE id = $16 RETURNING *',
        params
      );
      return res.json(result.rows[0]);
    }

    await dbRun(
      'UPDATE workshops SET title = ?, summary = ?, description = ?, date = ?, time = ?, duration = ?, location = ?, host = ?, topic = ?, status = ?, level = ?, capacity = ?, presentation_link = ?, prerequisites = ?, agenda = ? WHERE id = ?',
      params
    );
    const w = await dbGet('SELECT * FROM workshops WHERE id = ?', [id]);
    res.json(w);
  });

  // Admin: delete workshop
  app.delete('/api/admin/workshops/:id', authMiddleware, adminOnly, async (req, res) => {
    const id = req.params.id;
    await dbRun('DELETE FROM workshops WHERE id = ?', [id]);
    res.json({ success: true });
  });
}

module.exports = { workshopRoutes };