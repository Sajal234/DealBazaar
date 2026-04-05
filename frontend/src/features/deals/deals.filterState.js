const normalizeValue = (value) => (typeof value === 'string' ? value.trim() : '');

export function countActiveDealsFilters(filters) {
  let count = 0;

  if (normalizeValue(filters?.search)) {
    count += 1;
  }

  if (normalizeValue(filters?.city)) {
    count += 1;
  }

  if (normalizeValue(filters?.storeId)) {
    count += 1;
  }

  return count;
}

export function areDealsFiltersEqual(left, right) {
  return (
    normalizeValue(left?.search) === normalizeValue(right?.search) &&
    normalizeValue(left?.city) === normalizeValue(right?.city) &&
    normalizeValue(left?.storeId) === normalizeValue(right?.storeId) &&
    normalizeValue(left?.storeName) === normalizeValue(right?.storeName)
  );
}

export function removeDealsFilter(filters, key) {
  if (key === 'store') {
    return {
      ...filters,
      storeId: '',
      storeName: '',
      page: 1,
    };
  }

  return {
    ...filters,
    [key]: '',
    page: 1,
  };
}
