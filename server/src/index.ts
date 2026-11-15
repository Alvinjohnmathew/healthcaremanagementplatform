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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// API Routes
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
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend in production or when dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

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

app.listen(PORT, () => {
  console.log(`CareBridge Server running on http://localhost:${PORT}`);
  // Start the background proactive reminder scheduler
  scheduler.start();
});
