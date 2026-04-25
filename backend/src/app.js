import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import storeRoutes from './routes/store.routes.js';
import dealRoutes from './routes/deal.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
app.set('trust proxy', 1);

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Logging for HTTP requests
// (Cron job errors will be logged in their respective files via console.log/console.error)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'DealGrab API is running' });
});

// Core API Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler (basic error logging added here)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('[Global Error]', {
    message: err.message,
    path: req.originalUrl,
    method: req.method
  });

  // Multer errors (file too large, too many files)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload Error: ${err.message}`,
    });
  }

  // File type validation errors
  if (err.message && err.message.includes('Only JPG')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;
