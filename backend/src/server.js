// Standard ES Module AST hoisting forces imports to execute before running code.
// Loading variables via direct side-effect import guarantees strict evaluation order!
import 'dotenv/config';

import expireDealsJob from './jobs/expireDeals.js';
import cleanupImagesJob from './jobs/cleanupImages.js';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5050;

// Connect to MongoDB before starting the Express server
connectDB().then(() => {
  // Initialize Automated Daemon Services (CRON)
  expireDealsJob(); 
  cleanupImagesJob();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}).catch(error => {
  console.error('Failed to start server due to Database connection issue:', error.message);
  process.exit(1);
});
