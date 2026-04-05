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

const formatPhone = (value) => {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';

  if (digits.length !== 10) {
    return value || 'Not available';
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

export function mapStore(rawStore) {
  return {
    id: rawStore?._id || '',
    name: rawStore?.name || 'Verified local store',
    address: rawStore?.address || '',
    cityLabel: formatTitleCase(rawStore?.city, 'Local area'),
    cityValue: typeof rawStore?.city === 'string' ? rawStore.city : '',
    stateLabel: formatTitleCase(rawStore?.state, 'State'),
    stateValue: typeof rawStore?.state === 'string' ? rawStore.state : '',
    phoneLabel: formatPhone(rawStore?.phone),
    phone: rawStore?.phone || '',
    status: rawStore?.status || 'pending',
    isVerified: Boolean(rawStore?.isVerified),
    rating: Number.isFinite(Number(rawStore?.rating)) ? Number(rawStore.rating).toFixed(1) : null,
    totalRatings: Number.isFinite(Number(rawStore?.totalRatings)) ? Number(rawStore.totalRatings) : 0,
    myRating: Number.isFinite(Number(rawStore?.myRating)) ? Number(rawStore.myRating) : null,
    createdAt: rawStore?.createdAt || null,
  };
}
