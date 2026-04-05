import { normalizeOwnerDealStatus } from './storeDeals.filters';

function normalizePositivePage(value) {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

export function readStoreDealsSearchParams(searchParams) {
  return {
    status: normalizeOwnerDealStatus(searchParams.get('status')),
    page: normalizePositivePage(searchParams.get('page')),
  };
}

export function createStoreDealsSearchParams({ status = 'all', page = 1 } = {}) {
  const params = new URLSearchParams();
  const normalizedStatus = normalizeOwnerDealStatus(status);
  const normalizedPage = normalizePositivePage(page);

  if (normalizedStatus !== 'all') {
    params.set('status', normalizedStatus);
  }

  if (normalizedPage > 1) {
    params.set('page', String(normalizedPage));
  }

  return params;
}
