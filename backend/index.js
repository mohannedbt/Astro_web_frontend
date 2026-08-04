require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const logger = require('./src/utils/logger');
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
    logger.info('Redis disabled, using in-memory fallback');
    return memoryRedis;
  }

  try {
    const redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => logger.warn('Redis unavailable, using in-memory fallback', err.message));

    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis connection timeout')), 1500);
    });

    await Promise.race([connectPromise, timeoutPromise]);
    logger.info('Redis connected');
    return redisClient;
  } catch (error) {
    logger.warn('Redis unavailable, using in-memory fallback', error.message);
    return memoryRedis;
  }
}

(async () => {
  logger.info('Starting backend', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    logFile: process.env.LOG_FILE || 'disabled',
  });

  await initDatabase();
  logger.info('Database initialization complete');
  await seedAdmin();

  const redis = await initRedis();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    req.requestId = requestId;

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP request completed', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    });

    res.on('close', () => {
      if (!res.headersSent) {
        logger.warn('HTTP request closed early', {
          requestId,
          method: req.method,
          path: req.originalUrl,
        });
      }
    });

    next();
  });

  app.post('/api/logs/client', (req, res) => {
    const { level = 'info', message = 'Client log', details } = req.body || {};
    const normalizedLevel = ['debug', 'info', 'warn', 'error'].includes(level) ? level : 'info';
    logger[normalizedLevel](message, details);
    res.json({ ok: true });
  });

  authRoutes(app);
  workshopRoutes(app);
  eventRoutes(app);
  newsletterRoutes(app);
  positionRoutes(app, redis);
  newsRoutes(app, redis);
  adminRoutes(app);
  astrogamesRoutes(app);
  astronomyEventsRoutes(app);

  app.get('/api/health', (req, res) => {
    logger.info('Health check requested', { requestId: req.requestId });
    res.json({ status: 'ok' });
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    logger.error('Unhandled error', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      message: error.message,
      stack: error.stack,
    });
  });

  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    logger.error('Unhandled promise rejection', { message, stack });
  });

  app.listen(PORT, () => {
    logger.info(`Backend listening on ${PORT}`);
  });
})();
