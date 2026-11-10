require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');

const logger = require('./src/utils/logger');
// Imported early so a missing/weak JWT_SECRET stops the boot immediately.
require('./src/middleware/auth');
const { initDatabase, closeDatabase, dbGet } = require('./src/middleware/database');
const { initAstrogamesSchema } = require('./src/services/astrogamesSchema');
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
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SHUTDOWN_TIMEOUT_MS = 10000;

async function initRedis() {
  const memoryStore = new Map();
  const memoryRedis = {
    async connect() { return this; },
    async get(key) { return memoryStore.get(key) ?? null; },
    async set(key, value) { memoryStore.set(key, value); return 'OK'; },
    async del(key) { memoryStore.delete(key); return 1; },
    async quit() {},
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

// CORS_ORIGINS="https://app.example.com,https://www.example.com"
// Unset = allow any origin (kept so existing deployments don't break), but warn
// in production because an allowlist is the safer setting.
function buildCorsOptions() {
  const origins = (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);
  if (!origins.length) {
    if (IS_PRODUCTION) logger.warn('CORS_ORIGINS is not set: accepting requests from any origin');
    return {};
  }
  return {
    origin(origin, callback) {
      // No Origin header = non-browser client (curl, health checks): allow.
      if (!origin || origins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    maxAge: 600,
  };
}

async function main() {
  logger.info('Starting backend', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    logFile: process.env.LOG_FILE || 'disabled',
  });

  await initDatabase();
  await initAstrogamesSchema();
  logger.info('Database initialization complete');
  await seedAdmin();

  const redis = await initRedis();

  const app = express();
  app.disable('x-powered-by');
  // Hosts like Render/Heroku put a proxy in front of us. Without this, every
  // request appears to come from the proxy's IP and rate limiting would punish
  // all users together.
  app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
  app.use(helmet());
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '100kb' }));

  app.use((req, res, next) => {
    // Health checks fire constantly; logging them just buries real traffic.
    if (req.path === '/api/health') return next();

    const start = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    req.requestId = requestId;

    res.on('finish', () => {
      logger.info('HTTP request completed', {
        requestId,
        method: req.method,
        path: req.originalUrl.split('?')[0],
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      });
    });

    res.on('close', () => {
      if (!res.writableEnded) {
        logger.warn('HTTP request closed early', { requestId, method: req.method, path: req.originalUrl.split('?')[0] });
      }
    });

    next();
  });

  // Baseline limit for the whole API; stricter limits sit on login/register/scores.
  app.use('/api', rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
    message: { error: 'Too many requests, please slow down' },
  }));

  const clientLogLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });
  app.post('/api/logs/client', clientLogLimiter, (req, res) => {
    const { level = 'info', message = 'Client log', details } = req.body || {};
    const normalizedLevel = ['warn', 'error'].includes(level) ? level : 'info';
    // Clients are untrusted: cap what they can write into our logs.
    const safeMessage = `[client] ${String(message).slice(0, 200)}`;
    const safeDetails = JSON.stringify(details ?? null).slice(0, 1000);
    logger[normalizedLevel](safeMessage, safeDetails);
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

  // Hosting platforms poll this; it checks the database so a broken DB
  // connection marks the instance unhealthy instead of reporting "ok".
  app.get('/api/health', async (req, res) => {
    try {
      await dbGet('SELECT 1 AS ok');
      res.json({ status: 'ok' });
    } catch (error) {
      logger.error('Health check failed', { message: error.message });
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });

    logger.error('Unhandled error', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = app.listen(PORT, () => {
    logger.info(`Backend listening on ${PORT}`);
  });

  // Graceful shutdown: stop accepting connections, let in-flight requests
  // finish, close DB/Redis, then exit. Platforms send SIGTERM on every deploy.
  let shuttingDown = false;
  const shutdown = (reason, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('Shutting down', { reason });
    const forceExit = setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();
    server.close(async () => {
      try {
        await Promise.allSettled([closeDatabase(), redis.quit?.()]);
      } finally {
        process.exit(exitCode);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // After an uncaught exception the process state is undefined. The safe move
  // is to log and exit so the platform restarts a clean instance.
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { message: error.message, stack: error.stack });
    shutdown('uncaughtException', 1);
  });
  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    logger.error('Unhandled promise rejection', { message, stack: reason instanceof Error ? reason.stack : undefined });
    shutdown('unhandledRejection', 1);
  });
}

main().catch((error) => {
  logger.error('Failed to start backend', { message: error.message, stack: error.stack });
  process.exit(1);
});
