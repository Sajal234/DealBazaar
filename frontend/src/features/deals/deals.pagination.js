const normalizePositiveInteger = (value, fallback = 1) => {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

export function getSafeDealsPage(page, totalPages) {
  const normalizedPage = normalizePositiveInteger(page, 1);
  const normalizedTotalPages = normalizePositiveInteger(totalPages, 1);

  return Math.min(normalizedPage, normalizedTotalPages);
}
