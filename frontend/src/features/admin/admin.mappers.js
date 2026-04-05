const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const toTitleCase = (value, fallback) => {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDateLabel = (value, fallback = 'Unknown date') => {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return dateFormatter.format(parsed);
};

const formatPhone = (value) => {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';

  if (digits.length !== 10) {
    return value || 'Not available';
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const formatPrice = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'Price unavailable';
  }

  return currencyFormatter.format(numericValue);
};

const formatRating = (rating, totalRatings) => {
  const numericRating = Number(rating);
  const numericTotal = Number(totalRatings);

  if (!Number.isFinite(numericRating) || numericRating <= 0) {
    return 'No ratings yet';
  }

  if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
    return `${numericRating.toFixed(1)} / 5`;
  }

  return `${numericRating.toFixed(1)} / 5 from ${numericTotal} ratings`;
};

export function mapAdminStore(rawStore) {
  return {
    id: rawStore?._id || '',
    name: rawStore?.name || 'Pending store',
    address: rawStore?.address || 'Address not provided',
    cityLabel: toTitleCase(rawStore?.city, 'Local area'),
    stateLabel: toTitleCase(rawStore?.state, 'State'),
    phoneLabel: formatPhone(rawStore?.phone),
    ownerId: rawStore?.ownerId || 'Unknown owner',
    submittedAtLabel: formatDateLabel(rawStore?.createdAt),
    ratingLabel: formatRating(rawStore?.rating, rawStore?.totalRatings),
    isVerified: Boolean(rawStore?.isVerified),
  };
}

export function mapAdminDeal(rawDeal) {
  const store = rawDeal?.storeId && typeof rawDeal.storeId === 'object' ? rawDeal.storeId : null;

  return {
    id: rawDeal?._id || '',
    title: rawDeal?.productName || 'Pending deal',
    description: rawDeal?.description || 'No description provided.',
    priceLabel: formatPrice(rawDeal?.price),
    cityLabel: toTitleCase(rawDeal?.city, 'Local area'),
    submittedAtLabel: formatDateLabel(rawDeal?.createdAt),
    updatedAtLabel: formatDateLabel(rawDeal?.updatedAt),
    views: Number.isFinite(Number(rawDeal?.views)) ? Number(rawDeal.views) : 0,
    clicks: Number.isFinite(Number(rawDeal?.clicks)) ? Number(rawDeal.clicks) : 0,
    imageCount: Array.isArray(rawDeal?.images) ? rawDeal.images.length : 0,
    storeName: store?.name || 'Store not available',
    storeCityLabel: toTitleCase(store?.city, 'Local area'),
    storePhoneLabel: formatPhone(store?.phone),
    storeRatingLabel: formatRating(store?.rating, store?.totalRatings),
    storeIsVerified: Boolean(store?.isVerified),
  };
}
