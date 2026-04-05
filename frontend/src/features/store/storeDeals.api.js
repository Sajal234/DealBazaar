import { requestJson } from '../../lib/requestJson';
import { mapOwnedDeal } from './storeDeals.mappers';

function createOwnerDealsQueryString({ limit = 6, page = 1 } = {}) {
  const params = new URLSearchParams();

  params.set('limit', String(limit));
  params.set('page', String(page));

  return params.toString();
}

export async function listMyDeals({ limit = 6, page = 1, signal } = {}) {
  const payload = await requestJson(`/api/deals/mine?${createOwnerDealsQueryString({ limit, page })}`, {
    signal,
  });

  return {
    items: Array.isArray(payload.data) ? payload.data.map(mapOwnedDeal) : [],
    pagination: payload.pagination || null,
  };
}

export async function resubmitOwnedDeal(dealId) {
  const payload = await requestJson(`/api/deals/${encodeURIComponent(dealId)}/resubmit`, {
    method: 'PATCH',
  });

  return {
    deal: payload.data ? mapOwnedDeal(payload.data) : null,
    message: payload.message || 'Deal resubmitted successfully.',
  };
}

export async function archiveOwnedDeal(dealId) {
  const payload = await requestJson(`/api/deals/${encodeURIComponent(dealId)}`, {
    method: 'DELETE',
  });

  return {
    message: payload.message || 'Deal archived successfully.',
  };
}
