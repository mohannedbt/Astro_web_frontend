const { dbAll, dbGet, dbRun, usingPostgres } = require('../middleware/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const isHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

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
    const { title, summary, description, date, host, topic, status, level, image_url, presentation_link } = req.body;

    if (!title?.trim() || !host?.trim() || !topic?.trim() || !description?.trim() || !date
      || !['Beginner', 'Intermediate', 'Advanced'].includes(level)
      || !['upcoming', 'ongoing', 'completed'].includes(status)
      || !isHttpUrl(image_url)
      || (presentation_link && !isHttpUrl(presentation_link))) {
      return res.status(400).json({ error: 'Subject, instructor, description, date, status, difficulty, and valid URLs are required.' });
    }

    const params = [title.trim(), summary || description, description.trim(), date, host.trim(), topic.trim(), status, level, image_url, presentation_link || null];

    if (usingPostgres) {
      const result = await dbRun(
        'INSERT INTO workshops (title, summary, description, date, host, topic, status, level, image_url, presentation_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        params
      );
      return res.json(result.rows[0]);
    }

    const info = await dbRun(
      'INSERT INTO workshops (title, summary, description, date, host, topic, status, level, image_url, presentation_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params
    );
    const w = await dbGet('SELECT * FROM workshops WHERE id = ?', [info.lastInsertRowid]);
    res.json(w);
  });

  // Admin: update workshop
  app.put('/api/admin/workshops/:id', authMiddleware, adminOnly, async (req, res) => {
    const id = req.params.id;
    const { title, summary, description, date, host, topic, status, level, image_url, presentation_link } = req.body;

    if (!title?.trim() || !host?.trim() || !topic?.trim() || !description?.trim() || !date
      || !['Beginner', 'Intermediate', 'Advanced'].includes(level)
      || !['upcoming', 'ongoing', 'completed'].includes(status)
      || !isHttpUrl(image_url)
      || (presentation_link && !isHttpUrl(presentation_link))) {
      return res.status(400).json({ error: 'Subject, instructor, description, date, status, difficulty, and valid URLs are required.' });
    }

    const params = [title.trim(), summary || description, description.trim(), date, host.trim(), topic.trim(), status, level, image_url, presentation_link || null, id];

    if (usingPostgres) {
      const result = await dbRun(
        'UPDATE workshops SET title = $1, summary = $2, description = $3, date = $4, host = $5, topic = $6, status = $7, level = $8, image_url = $9, presentation_link = $10 WHERE id = $11 RETURNING *',
        params
      );
      return res.json(result.rows[0]);
    }

    await dbRun(
      'UPDATE workshops SET title = ?, summary = ?, description = ?, date = ?, host = ?, topic = ?, status = ?, level = ?, image_url = ?, presentation_link = ? WHERE id = ?',
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