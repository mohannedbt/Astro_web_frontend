const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const MIN_SECRET_LENGTH = 32;

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;

  // A missing/weak secret in production means anyone could forge an admin
  // token, so refuse to boot rather than silently run insecurely.
  if (isProduction) {
    throw new Error(`JWT_SECRET must be set to a random string of at least ${MIN_SECRET_LENGTH} characters in production`);
  }

  if (secret) return secret;
  // Dev only: random per-process secret (tokens stop working on restart).
  logger.warn('JWT_SECRET is not set; using a temporary random secret for this process');
  return crypto.randomBytes(48).toString('hex');
}

const JWT_SECRET = resolveJwtSecret();

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name || '',
      username: user.username || '',
      bio: user.bio || '',
      location: user.location || '',
      avatar_seed: user.avatar_seed || '',
      is_admin: !!user.is_admin,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' }
  );
}

function readBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return '';
  return auth.slice('Bearer '.length).trim();
}

function verifyToken(token) {
  // Pin the algorithm so a token can't pick a weaker one (e.g. "none").
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

function authMiddleware(req, res, next) {
  const token = readBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  try {
    req.user = verifyToken(token);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Attaches req.user when a valid token is present, but lets anonymous
// requests through (used by public read endpoints).
function optionalAuth(req, res, next) {
  const token = readBearerToken(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch (e) {
      // Ignore: treated as anonymous.
    }
  }
  next();
}

function adminOnly(req, res, next) {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ error: 'Admins only' });
  next();
}

module.exports = {
  signToken,
  authMiddleware,
  optionalAuth,
  adminOnly,
};
