import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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
  res.status(200).json({ success: true, message: 'DealBazaar API is running' });
});

// Routes will be mounted here shortly:
// app.use('/api/auth', authRoutes);
// app.use('/api/stores', storeRoutes);
// app.use('/api/deals', dealRoutes);
// app.use('/api/admin', adminRoutes);

// Global Error Handler (basic error logging added here)
app.use((err, req, res, next) => {
  console.error(`[Global Error Handler]`, err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;
