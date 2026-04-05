const formatPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'Price on request';
  }

  return `₹${amount.toLocaleString('en-IN')}`;
};

const formatTitleCase = (value, fallback) => {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDate = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusMeta = {
  pending: {
    label: 'Pending review',
    tone: 'pending',
  },
  active: {
    label: 'Live',
    tone: 'active',
  },
  rejected: {
    label: 'Rejected',
    tone: 'rejected',
  },
  expired: {
    label: 'Expired',
    tone: 'expired',
  },
};

export function mapOwnedDeal(rawDeal) {
  const status = rawDeal?.status || 'pending';
  const meta = statusMeta[status] || statusMeta.pending;

  return {
    id: rawDeal?._id || '',
    title: rawDeal?.productName || 'Untitled deal',
    description: rawDeal?.description || 'No description provided.',
    cityLabel: formatTitleCase(rawDeal?.city, 'Local area'),
    priceLabel: formatPrice(rawDeal?.price),
    imageUrl: Array.isArray(rawDeal?.images) && rawDeal.images.length > 0 ? rawDeal.images[0] : '',
    status,
    statusLabel: meta.label,
    statusTone: meta.tone,
    views: Number.isFinite(Number(rawDeal?.views)) ? Number(rawDeal.views) : 0,
    clicks: Number.isFinite(Number(rawDeal?.clicks)) ? Number(rawDeal.clicks) : 0,
    updatedAtLabel: formatDate(rawDeal?.updatedAt || rawDeal?.createdAt, 'Recently updated'),
    expiresAtLabel: rawDeal?.expiresAt ? formatDate(rawDeal.expiresAt, null) : null,
  };
}
