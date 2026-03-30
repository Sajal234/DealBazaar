import dotenv from 'dotenv';
// Load environment variables immediately before any other imports
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the Express server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}).catch(error => {
  console.error('Failed to start server due to Database connection issue:', error.message);
  process.exit(1);
});
