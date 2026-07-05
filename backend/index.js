require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const { initDatabase } = require('./src/middleware/database');
const { authRoutes } = require('./src/routes/auth');
const { workshopRoutes } = require('./src/routes/workshops');
const { eventRoutes } = require('./src/routes/events');
const { newsletterRoutes } = require('./src/routes/newsletter');
const { positionRoutes } = require('./src/routes/position');
const { newsRoutes } = require('./src/routes/news');
const { adminRoutes } = require('./src/routes/admin');

const PORT = process.env.PORT || 5000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

(async () => {
  await initDatabase();

  const redis = createClient({ url: REDIS_URL });
  redis.on('error', (err) => console.error('Redis Client Error', err));
  await redis.connect();

  const app = express();
  app.use(cors());
  app.use(express.json());

  authRoutes(app);
  workshopRoutes(app);
  eventRoutes(app);
  newsletterRoutes(app);
  positionRoutes(app, redis);
  newsRoutes(app, redis);
  adminRoutes(app);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
})();
