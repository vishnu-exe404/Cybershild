require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const analysisRoutes = require('./routes/analysisRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const requireAuth = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const db = require('./config/database');
const userModel = require('./models/userModel');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security / infra middleware ---
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin) and configured origins only.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '100kb' })); // small limit - this app only accepts short pasted text

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait a moment before trying again.',
  },
});
app.use('/api/', limiter);

// --- Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'csap-backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analysisRoutes);
// The analytics dashboard requires login - see backend/middleware/authMiddleware.js
app.use('/api/analytics', requireAuth, analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

async function start() {
  await db.init();
  await userModel.ensureAdminSeed();
  app.listen(PORT, () => {
    console.log(`CSAP backend listening on port ${PORT}`);
  });
}

start();

module.exports = app;
