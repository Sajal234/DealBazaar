const normalizeValue = (value) => (typeof value === 'string' ? value.trim() : '');

export function countActiveDealsFilters(filters) {
  let count = 0;

  if (normalizeValue(filters?.search)) {
    count += 1;
  }

  if (normalizeValue(filters?.city)) {
    count += 1;
  }

  return count;
}

export function areDealsFiltersEqual(left, right) {
  return (
    normalizeValue(left?.search) === normalizeValue(right?.search) &&
    normalizeValue(left?.city) === normalizeValue(right?.city)
  );
}

export function removeDealsFilter(filters, key) {
  return {
    ...filters,
    [key]: '',
    page: 1,
  };
}
