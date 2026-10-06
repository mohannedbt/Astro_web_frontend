const logger = require('../utils/logger');
const { dbAll, dbRun, dbGet } = require('../middleware/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { fetchFacebookEvents } = require('../services/facebook');

function eventRoutes(app) {
  // Members: get all events
  app.get('/api/events', authMiddleware, async (req, res) => {
    try {
      const rows = await dbAll('SELECT * FROM events ORDER BY start_time DESC, id DESC');
      res.json(rows);
    } catch (e) {
      logger.error('Failed to get events', { message: e.message });
      res.status(500).json({ error: 'Failed to retrieve events' });
    }
  });

  // Admin: create an event
  app.post('/api/admin/events', authMiddleware, adminOnly, async (req, res) => {
    const { title, date, start_time, time, location, description, image_url, category, capacity, status, gallery } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const finalStartTime = start_time || date || new Date().toISOString();
    try {
      await dbRun(
        `INSERT INTO events (title, start_time, time, location, description, image_url, category, capacity, status, gallery)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          finalStartTime,
          time || '',
          location || '',
          description || '',
          image_url || '',
          category || 'stargazing',
          Number(capacity) || 0,
          status || 'Upcoming',
          typeof gallery === 'string' ? gallery : JSON.stringify(gallery || []),
        ]
      );
      const rows = await dbAll('SELECT * FROM events ORDER BY id DESC LIMIT 1');
      res.status(201).json(rows[0] || { success: true });
    } catch (e) {
      logger.error('Failed to create event', { message: e.message });
      res.status(500).json({ error: e.message });
    }
  });

  // Admin: update an event
  app.put('/api/admin/events/:id', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { title, date, start_time, time, location, description, image_url, category, capacity, status, gallery } = req.body;
    try {
      const existing = await dbGet('SELECT * FROM events WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const finalStartTime = start_time || date || existing.start_time;
      await dbRun(
        `UPDATE events
         SET title = ?, start_time = ?, time = ?, location = ?, description = ?, image_url = ?, category = ?, capacity = ?, status = ?, gallery = ?
         WHERE id = ?`,
        [
          title ?? existing.title,
          finalStartTime,
          time ?? existing.time,
          location ?? existing.location,
          description ?? existing.description,
          image_url ?? existing.image_url,
          category ?? existing.category,
          Number(capacity) ?? existing.capacity,
          status ?? existing.status,
          typeof gallery === 'string' ? gallery : JSON.stringify(gallery || []),
          id,
        ]
      );
      const updated = await dbGet('SELECT * FROM events WHERE id = ?', [id]);
      res.json(updated);
    } catch (e) {
      logger.error('Failed to update event', { message: e.message, id });
      res.status(500).json({ error: e.message });
    }
  });

  // Admin: delete an event
  app.delete('/api/admin/events/:id', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.params;
    try {
      await dbRun('DELETE FROM events WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (e) {
      logger.error('Failed to delete event', { message: e.message, id });
      res.status(500).json({ error: e.message });
    }
  });

  // Admin: fetch Facebook events
  app.post('/api/admin/fetch-facebook-events', authMiddleware, adminOnly, async (req, res) => {
    const pageId = process.env.FACEBOOK_PAGE_ID || req.body.pageId;
    const token = process.env.FACEBOOK_ACCESS_TOKEN || req.body.accessToken;
    try {
      const count = await fetchFacebookEvents(pageId, token);
      res.json({ fetched: count });
    } catch (e) {
      logger.error('Failed to fetch Facebook events', { message: e.message, stack: e.stack, pageId });
      res.status(500).json({ error: e.message });
    }
  });
}

module.exports = { eventRoutes };