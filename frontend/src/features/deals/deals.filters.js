const normalizeFilterValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

export function readDealsFilters(searchParams) {
  return {
    search: normalizeFilterValue(searchParams.get('search')),
    city: normalizeFilterValue(searchParams.get('city')),
  };
}

export function createDealsSearchParams({ search = '', city = '' } = {}) {
  const params = new URLSearchParams();
  const normalizedSearch = normalizeFilterValue(search);
  const normalizedCity = normalizeFilterValue(city);

  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  if (normalizedCity) {
    params.set('city', normalizedCity);
  }

  return params;
}

export function hasDealsFilters(filters) {
  return Boolean(normalizeFilterValue(filters?.search) || normalizeFilterValue(filters?.city));
}
