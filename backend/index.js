require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const { initDatabase } = require('./src/middleware/database');
const { seedAdmin } = require('./seedAdmin');
const { authRoutes } = require('./src/routes/auth');
const { workshopRoutes } = require('./src/routes/workshops');
const { eventRoutes } = require('./src/routes/events');
const { newsletterRoutes } = require('./src/routes/newsletter');
const { positionRoutes } = require('./src/routes/position');
const { newsRoutes } = require('./src/routes/news');
const { adminRoutes } = require('./src/routes/admin');
const { astrogamesRoutes } = require('./src/routes/astrogames');
const { astronomyEventsRoutes } = require('./src/routes/astronomy-events');

const PORT = process.env.PORT || 5000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

async function initRedis() {
  const memoryStore = new Map();
  const memoryRedis = {
    async connect() { return this; },
    async get(key) { return memoryStore.get(key) ?? null; },
    async set(key, value) { memoryStore.set(key, value); return 'OK'; },
    async del(key) { memoryStore.delete(key); return 1; },
    on() { return this; },
  };

  if (!process.env.REDIS_URL) {
    return memoryRedis;
  }

  try {
    const redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => console.warn('Redis unavailable, using in-memory fallback:', err.message));

    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 1500);
    });

    await Promise.race([connectPromise, timeoutPromise]);
    console.log('Redis connected');
    return redisClient;
  } catch (error) {
    console.warn('Redis unavailable, using in-memory fallback:', error.message);
    return memoryRedis;
  }
}

(async () => {
  await initDatabase();
  await seedAdmin();

  const redis = await initRedis();

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
  astrogamesRoutes(app);
  astronomyEventsRoutes(app);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
})();
