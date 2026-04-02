import cron from 'node-cron';
import Deal from '../models/Deal.js';
import { destroyCloudinaryAssets } from '../utils/cloudinaryAssets.js';

const CLEANUP_RETRY_DELAY_MS = 6 * 60 * 60 * 1000;

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
      }).select('imagePublicIds images _id'); // Massive RAM projection optimization again!

      if (dealsToClean.length === 0) {
        console.log('[Cron-Queue-2] Sweep complete. 0 Cloudinary items required deletion.');
        return;
      }

      console.log(`[Cron-Queue-2] Found ${dealsToClean.length} deals passed 72h window. Purging Cloudinary storage...`);

      let totalImagesDeleted = 0;
      let fullyCleanedDeals = 0;
      let retryQueuedDeals = 0;
      const bulkOps = [];

      for (const deal of dealsToClean) {
        const { deletedIds, failedIds, failures } = await destroyCloudinaryAssets(deal.imagePublicIds);
        totalImagesDeleted += deletedIds.length;

        if (failures.length > 0) {
          console.error('[Cron-Queue-2] Cloudinary deletion failed for some assets. Deal retained for retry.', {
            dealId: deal._id.toString(),
            failures,
          });
        }

        if (failedIds.length > 0) {
          const failedIdSet = new Set(failedIds);
          const remainingAssets = (deal.imagePublicIds || [])
            .map((publicId, index) => ({
              publicId,
              imageUrl: (deal.images || [])[index],
            }))
            .filter((asset) => failedIdSet.has(asset.publicId));

          bulkOps.push({
            updateOne: {
              filter: { _id: deal._id },
              update: {
                $set: {
                  cleanupAt: new Date(Date.now() + CLEANUP_RETRY_DELAY_MS),
                  images: remainingAssets.map((asset) => asset.imageUrl),
                  imagePublicIds: remainingAssets.map((asset) => asset.publicId),
                },
              },
            },
          });
          retryQueuedDeals += 1;
          continue;
        }

        bulkOps.push({
          updateOne: {
            filter: { _id: deal._id },
            update: {
              $set: { 
                isDeleted: true,
                images: [],
                imagePublicIds: []
              },
              $unset: { cleanupAt: 1 }
            }
          }
        });
        fullyCleanedDeals += 1;
      }

      // 3. Execute the database transaction in one high-performance shot
      if (bulkOps.length > 0) {
        const result = await Deal.bulkWrite(bulkOps);
        console.log(
          `[Cron-Queue-2] Success! Scrubbed ${totalImagesDeleted} Cloudinary files, soft-deleted ${fullyCleanedDeals} deals, and retained ${retryQueuedDeals} deals for retry. Updated ${result.modifiedCount} deal records.`
        );
      }

    } catch (error) {
      console.error('[Cron-Queue-2] FATAL Error during Cloudinary Image Sweep:', error);
    }
  });
};

export default cleanupImagesJob;
