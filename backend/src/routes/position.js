const { authMiddleware } = require('../middleware/auth');

function positionRoutes(app, redis) {
  // Position caching per user in Redis
  app.post('/api/position', authMiddleware, async (req, res) => {
    const { lat, lon } = req.body;
    if (typeof lat !== 'number' || typeof lon !== 'number') return res.status(400).json({ error: 'lat and lon required' });
    const key = `position:${req.user.id}`;
    await redis.set(key, JSON.stringify({ lat, lon, updated: Date.now() }), { EX: 60 * 60 });
    res.json({ success: true });
  });

  app.get('/api/position', authMiddleware, async (req, res) => {
    const key = `position:${req.user.id}`;
    const v = await redis.get(key);
    if (!v) return res.status(404).json({});
    res.json(JSON.parse(v));
  });
}

module.exports = { positionRoutes };