import cloudinary from '../config/cloudinary.js';

const successfulDestroyResults = new Set(['ok', 'not found']);

export const destroyCloudinaryAssets = async (publicIds = []) => {
  const ids = [...new Set(publicIds.filter(Boolean))];

  if (ids.length === 0) {
    return {
      deletedIds: [],
      failedIds: [],
      failures: [],
    };
  }

  const settledResults = await Promise.allSettled(
    ids.map((publicId) => cloudinary.uploader.destroy(publicId))
  );

  const deletedIds = [];
  const failedIds = [];
  const failures = [];

  settledResults.forEach((result, index) => {
    const publicId = ids[index];

    if (
      result.status === 'fulfilled' &&
      successfulDestroyResults.has(result.value?.result)
    ) {
      deletedIds.push(publicId);
      return;
    }

    failedIds.push(publicId);
    failures.push({
      publicId,
      error:
        result.status === 'rejected'
          ? result.reason?.message || String(result.reason)
          : `Unexpected Cloudinary destroy result: ${result.value?.result || 'unknown'}`,
    });
  });

  return {
    deletedIds,
    failedIds,
    failures,
  };
};
