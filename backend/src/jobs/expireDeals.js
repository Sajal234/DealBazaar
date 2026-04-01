import cron from 'node-cron';
import Deal from '../models/Deal.js';

// Setup Cron Job: Runs at minute 0 of every single hour (Hourly)
const expireDealsJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[Cron-Queue-1] Initiating Deal Expiration Check...');
      const now = new Date();

      // Strict sweep: Find deals that are 'active' but past their expiresAt date
      const expiredDeals = await Deal.find(
        {
          status: 'active',
          expiresAt: { $lt: now }
        },
        { _id: 1 }
      );

      if (expiredDeals.length === 0) {
        console.log('[Cron-Queue-1] Sweep complete. 0 active deals expired.');
        return;
      }

      console.log(`[Cron-Queue-1] Found ${expiredDeals.length} expired deals in the sweep. Processing bulk transition...`);

      // Extreme Performance Optimization: 
      // Using bulkWrite prevents an N+1 Database overhead crash when expiring 10,000+ deals simultaneously.
      const bulkOps = expiredDeals.map((deal) => {
        // Enforce Architecture: Schedule for Cloudinary sweep exactly 72 hours from this moment
        const cleanupDate = new Date();
        cleanupDate.setHours(cleanupDate.getHours() + 72);

        return {
          updateOne: {
            filter: { _id: deal._id },
            update: {
              $set: { 
                status: 'expired',
                cleanupAt: cleanupDate 
              },
              // Hard wipe the old timers strictly
              $unset: { expiresAt: 1, lastVerifiedAt: 1 } 
            }
          }
        };
      });

      const result = await Deal.bulkWrite(bulkOps);
      console.log(`[Cron-Queue-1] Success! ${result.modifiedCount} deals locked to 'expired' and queued for Cloudinary cleanup.`);

    } catch (error) {
      console.error('[Cron-Queue-1] FATAL Error during Deal Expiration Job:', error);
    }
  });
};

export default expireDealsJob;
