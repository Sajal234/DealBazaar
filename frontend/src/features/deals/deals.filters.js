const normalizeFilterValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const normalizePageValue = (value) => {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
};

export function readDealsFilters(searchParams) {
  return {
    search: normalizeFilterValue(searchParams.get('search')),
    city: normalizeFilterValue(searchParams.get('city')),
    page: normalizePageValue(searchParams.get('page')),
  };
}

export function createDealsSearchParams({ search = '', city = '', page = 1 } = {}) {
  const params = new URLSearchParams();
  const normalizedSearch = normalizeFilterValue(search);
  const normalizedCity = normalizeFilterValue(city);
  const normalizedPage = normalizePageValue(page);

  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  if (normalizedCity) {
    params.set('city', normalizedCity);
  }

  if (normalizedPage > 1) {
    params.set('page', String(normalizedPage));
  }

  return params;
}

export function hasDealsFilters(filters) {
  return Boolean(normalizeFilterValue(filters?.search) || normalizeFilterValue(filters?.city));
}
