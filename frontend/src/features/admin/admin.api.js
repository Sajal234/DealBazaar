import { requestJson } from '../../lib/requestJson';
import { mapAdminDeal, mapAdminStore } from './admin.mappers';

const normalizePagination = (rawPagination) => ({
  total: Number.isFinite(Number(rawPagination?.total)) ? Number(rawPagination.total) : 0,
  page: Number.isFinite(Number(rawPagination?.page)) ? Number(rawPagination.page) : 1,
  pages: Number.isFinite(Number(rawPagination?.pages)) ? Number(rawPagination.pages) : 1,
});

export async function listPendingStores({ page = 1, limit = 6, signal } = {}) {
  const payload = await requestJson(
    `/api/admin/stores/pending?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
    { signal }
  );

  return {
    items: Array.isArray(payload?.data) ? payload.data.map(mapAdminStore) : [],
    pagination: normalizePagination(payload?.pagination),
  };
}

export async function listPendingDeals({ page = 1, limit = 6, signal } = {}) {
  const payload = await requestJson(
    `/api/admin/deals/pending?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
    { signal }
  );

  return {
    items: Array.isArray(payload?.data) ? payload.data.map(mapAdminDeal) : [],
    pagination: normalizePagination(payload?.pagination),
  };
}

export async function updatePendingStoreStatus({ storeId, status }) {
  const payload = await requestJson(`/api/admin/stores/${encodeURIComponent(storeId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  return {
    message: payload?.message || `Store marked as ${status}.`,
  };
}

export async function updatePendingDealStatus({ dealId, status, hoursValid = 48 }) {
  const payload = await requestJson(`/api/admin/deals/${encodeURIComponent(dealId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, hoursValid }),
  });

  return {
    message: payload?.message || `Deal marked as ${status}.`,
  };
}
