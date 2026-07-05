const axios = require('axios');

function newsRoutes(app, redis) {
  // News caching: avoid calling external news API twice
  app.get('/api/news', async (req, res) => {
    const limit = req.query.limit || 6;
    const cacheKey = `news:latest:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const NEWS_API_URL = process.env.NEWS_API_URL || 'https://api.spaceflightnewsapi.net/v4/articles?limit=' + limit;
    if (!NEWS_API_URL) {
      const sample = { articles: [{ title: 'No NEWS_API_URL configured', content: 'Set NEWS_API_URL in backend/.env' }] };
      await redis.set(cacheKey, JSON.stringify(sample), { EX: 60 * 5 });
      return res.json(sample);
    }

    try {
      const url = NEWS_API_URL.includes('?') ? NEWS_API_URL : NEWS_API_URL + `?limit=${limit}`;
      const resp = await axios.get(url);
      await redis.set(cacheKey, JSON.stringify(resp.data), { EX: 60 * 5 });
      res.json(resp.data);
    } catch (e) {
      console.error('news fetch error', e.message);
      return res.status(502).json({ error: 'news fetch failed' });
    }
  });
}

module.exports = { newsRoutes };