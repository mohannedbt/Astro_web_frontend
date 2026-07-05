const { dbAll } = require('../middleware/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

function adminRoutes(app) {
  app.get('/api/admin/stats', authMiddleware, adminOnly, async (req, res) => {
    const users = await dbAll('SELECT COUNT(*) AS count FROM users');
    const workshops = await dbAll('SELECT COUNT(*) AS count FROM workshops');
    const subscribers = await dbAll('SELECT COUNT(*) AS count FROM newsletter_subscribers');
    res.json({
      users: users[0]?.count || 0,
      workshops: workshops[0]?.count || 0,
      subscribers: subscribers[0]?.count || 0,
    });
  });
}

module.exports = { adminRoutes };