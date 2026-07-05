const { dbAll } = require('../middleware/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { fetchFacebookEvents } = require('../services/facebook');

function eventRoutes(app) {
  // Public: get all events
  app.get('/api/events', async (req, res) => {
    const rows = await dbAll('SELECT * FROM events ORDER BY start_time DESC');
    res.json(rows);
  });

  // Admin: fetch Facebook events
  app.post('/api/admin/fetch-facebook-events', authMiddleware, adminOnly, async (req, res) => {
    const pageId = process.env.FACEBOOK_PAGE_ID || req.body.pageId;
    const token = process.env.FACEBOOK_ACCESS_TOKEN || req.body.accessToken;
    try {
      const count = await fetchFacebookEvents(pageId, token);
      res.json({ fetched: count });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

module.exports = { eventRoutes };