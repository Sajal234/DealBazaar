const formatPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'Price on request';
  }

  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatCity = (value) => {
  if (!value || typeof value !== 'string') {
    return 'Local area';
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const normalizeStore = (rawStore) => {
  if (!rawStore || typeof rawStore !== 'object' || Array.isArray(rawStore)) {
    return null;
  }

  return {
    id: rawStore._id || '',
    name: rawStore.name || 'Verified local store',
    city: formatCity(rawStore.city),
    phone: rawStore.phone || '',
    rating: Number.isFinite(Number(rawStore.rating)) ? Number(rawStore.rating).toFixed(1) : null,
    isVerified: Boolean(rawStore.isVerified),
  };
};

export const mapDealSummary = (rawDeal) => ({
  id: rawDeal?._id || '',
  title: rawDeal?.productName || 'Untitled deal',
  description: rawDeal?.description || 'No description available.',
  priceLabel: formatPrice(rawDeal?.price),
  cityLabel: formatCity(rawDeal?.city),
  imageUrl: Array.isArray(rawDeal?.images) && rawDeal.images.length > 0 ? rawDeal.images[0] : '',
  images: Array.isArray(rawDeal?.images) ? rawDeal.images : [],
  store: normalizeStore(rawDeal?.storeId),
  status: rawDeal?.status || 'active',
});

export const mapDealDetail = (rawDeal) => ({
  ...mapDealSummary(rawDeal),
  createdAt: rawDeal?.createdAt || null,
  updatedAt: rawDeal?.updatedAt || null,
});
