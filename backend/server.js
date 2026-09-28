require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const analysisRoutes = require('./routes/analysisRoutes');
const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const historyRoutes = require('./routes/historyRoutes');
const errorHandler = require('./middleware/errorHandler');
const prisma = require('./config/prisma');

const app = express();
const PORT = process.env.PORT || 5000;

// Behind a proxy (Render, Railway, Vercel...) so rate limiting sees the real client IP.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// --- Security / infra middleware ---
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // required so the browser sends/receives session cookies
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment before trying again.' },
});
app.use('/api/', limiter);

// A stricter limiter on auth endpoints to slow down credential-guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait a few minutes and try again.' },
});
app.use(
  ['/api/auth/login', '/api/auth/register', '/api/admin/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'],
  authLimiter
);

// --- Routes ---
app.get('/api/health', async (req, res) => {
  let db = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = 'down';
  }
  res.status(db === 'ok' ? 200 : 503).json({
    status: db === 'ok' ? 'ok' : 'degraded',
    db,
    service: 'cybershild-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/analyze', analysisRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes); // user management + /api/admin/stats, all requireAdmin-protected

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

async function start() {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('[startup] Could not connect to the database. Check DATABASE_URL in your .env file.');
    console.error(err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`CyberShild backend listening on port ${PORT}`);
  });
}

start();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
