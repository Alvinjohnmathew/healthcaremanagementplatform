import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import profileRoutes from './routes/profileRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import careCircleRoutes from './routes/careCircleRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { scheduler } from './services/scheduler.js';
import {
  securityHeaders,
  sanitizeInputs,
  apiRateLimiter,
  errorHandler
} from './middleware/security.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (CSP, HSTS, X-Content-Type-Options, Permissions-Policy)
app.use(securityHeaders);

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Bypass-Rate-Limit']
}));

// Body parser with 1MB payload ceiling to prevent memory denial-of-service
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization against XSS & prototype pollution
app.use(sanitizeInputs);

// Request logger with structured request ID & response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  const reqId = (req as any).requestId || '-';
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] [${reqId}] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes with rate limiter protection
app.use('/api', apiRateLimiter);
app.use('/api/profiles', profileRoutes);
app.use('/api', medicationRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', routineRoutes);
app.use('/api', careCircleRoutes);
app.use('/api', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SilverCare Connect / CareBridge 360 Healthcare Management Platform',
    version: '1.2.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend in production or when dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath, {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('CareBridge Frontend is building or running in Vite dev server.');
    }
  });
});

// Centralized Safe Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CareBridge Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  // Start the background proactive reminder scheduler
  scheduler.start();
});
