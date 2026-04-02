const toPlainObject = (doc) => {
  if (!doc) {
    return null;
  }

  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
};

const removeUndefined = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));

export const serializeStore = (store, options = {}) => {
  const { includeOwnerId = false, viewerRating } = options;
  const storeObject = toPlainObject(store);

  if (!storeObject) {
    return null;
  }

  const serialized = {
    _id: storeObject._id,
    name: storeObject.name,
    address: storeObject.address,
    state: storeObject.state,
    city: storeObject.city,
    phone: storeObject.phone,
    status: storeObject.status,
    isVerified: storeObject.isVerified,
    rating: storeObject.rating,
    totalRatings: storeObject.totalRatings,
    createdAt: storeObject.createdAt,
    updatedAt: storeObject.updatedAt,
  };

  if (includeOwnerId) {
    serialized.ownerId = storeObject.ownerId;
  }

  if (viewerRating !== undefined) {
    serialized.myRating = viewerRating;
  }

  return removeUndefined(serialized);
};

export const serializeStoreSummary = (store) => {
  const storeObject = toPlainObject(store);

  if (!storeObject) {
    return null;
  }

  return removeUndefined({
    _id: storeObject._id,
    name: storeObject.name,
    address: storeObject.address,
    city: storeObject.city,
    phone: storeObject.phone,
    rating: storeObject.rating,
    totalRatings: storeObject.totalRatings,
    isVerified: storeObject.isVerified,
  });
};

export const serializeDeal = (deal, options = {}) => {
  const { includeMetrics = false, includeLifecycle = false, includeImagePublicIds = false } = options;
  const dealObject = toPlainObject(deal);

  if (!dealObject) {
    return null;
  }

  const serialized = {
    _id: dealObject._id,
    storeId:
      dealObject.storeId && typeof dealObject.storeId === 'object' && !Array.isArray(dealObject.storeId)
        ? serializeStoreSummary(dealObject.storeId)
        : dealObject.storeId,
    productName: dealObject.productName,
    description: dealObject.description,
    price: dealObject.price,
    city: dealObject.city,
    images: dealObject.images,
    status: dealObject.status,
    createdAt: dealObject.createdAt,
    updatedAt: dealObject.updatedAt,
  };

  if (includeMetrics) {
    serialized.views = dealObject.views;
    serialized.clicks = dealObject.clicks;
  }

  if (includeImagePublicIds) {
    serialized.imagePublicIds = dealObject.imagePublicIds;
  }

  if (includeLifecycle) {
    serialized.expiresAt = dealObject.expiresAt;
    serialized.lastVerifiedAt = dealObject.lastVerifiedAt;
    serialized.cleanupAt = dealObject.cleanupAt;
    serialized.isDeleted = dealObject.isDeleted;
  }

  return removeUndefined(serialized);
};
