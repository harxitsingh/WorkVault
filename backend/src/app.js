import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { config } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── SECURITY HEADERS (Helmet) ───────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// ─── CORS ────────────────────────────────────────────────
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (config.allowedOrigins && config.allowedOrigins.includes(origin)) return true;
  // In development, also accept any localhost/127.0.0.1 port
  if (config.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
  })
);

// ─── BODY PARSING (with rawBody capture for Stripe webhook) ─
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── STATIC FILE SERVING (uploads) ──────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── PRODUCTION HEALTH CHECK ─────────────────────────────
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    success: true,
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv || 'development',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      name: mongoose.connection.name || 'workvault'
    },
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    },
    services: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      storage: 'local_uploads'
    }
  });
});

// ─── API ROUTES ──────────────────────────────────────────
app.use('/api', routes);

// ─── ERROR HANDLING ──────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
