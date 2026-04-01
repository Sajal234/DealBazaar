import cron from 'node-cron';
import cloudinary from '../config/cloudinary.js';
import Deal from '../models/Deal.js';

// Setup Cron Job: Runs once a day at 3:00 AM server time (Low Traffic Period)
const cleanupImagesJob = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('[Cron-Queue-2] Initiating Cloudinary Storage Sweep...');
      const now = new Date();

      // Find deals that have safely passed their 72-hour cleanup grace period
      // (This inherently catches both 'expired' and 'rejected' deals!)
      const dealsToClean = await Deal.find({
        status: { $in: ['expired', 'rejected'] },
        cleanupAt: { $lt: now },
        isDeleted: false
      }).select('imagePublicIds _id'); // Massive RAM projection optimization again!

      if (dealsToClean.length === 0) {
        console.log('[Cron-Queue-2] Sweep complete. 0 Cloudinary items required deletion.');
        return;
      }

      console.log(`[Cron-Queue-2] Found ${dealsToClean.length} deals passed 72h window. Purging Cloudinary storage...`);

      let totalImagesDeleted = 0;
      const bulkOps = [];

      for (const deal of dealsToClean) {
        // 1. Strip all images from Cloudinary concurrently for each deal
        if (deal.imagePublicIds && deal.imagePublicIds.length > 0) {
          const destroyPromises = deal.imagePublicIds.map(id => cloudinary.uploader.destroy(id));
          await Promise.allSettled(destroyPromises); // Native Cloudinary SDK deletion
          totalImagesDeleted += deal.imagePublicIds.length;
        }

        // 2. Prepare the Soft-Delete database transaction honoring your 'isDeleted' architecture
        bulkOps.push({
          updateOne: {
            filter: { _id: deal._id },
            update: {
              $set: { 
                isDeleted: true,
                images: [],          // Clear URLs to save Mongo document sizing bytes
                imagePublicIds: []   // Completely detach Cloudinary tracking links
              },
              $unset: { cleanupAt: 1 } // Stop tracking this deal permanently
            }
          }
        });
      }

      // 3. Execute the database transaction in one high-performance shot
      if (bulkOps.length > 0) {
        const result = await Deal.bulkWrite(bulkOps);
        console.log(`[Cron-Queue-2] Success! Scrubbed ${totalImagesDeleted} Cloudinary files to save bandwidth, and soft-deleted ${result.modifiedCount} deals from active query cycles.`);
      }

    } catch (error) {
      console.error('[Cron-Queue-2] FATAL Error during Cloudinary Image Sweep:', error);
    }
  });
};

export default cleanupImagesJob;
