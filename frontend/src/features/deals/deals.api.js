import { createApiUrl, requestJson } from '../../lib/requestJson';
import { mapDealDetail, mapDealSummary } from './deals.mappers';

function createDealsQueryString({ limit = 12, page = 1, search = '', city = '' } = {}) {
  const params = new URLSearchParams();

  params.set('limit', String(limit));
  params.set('page', String(page));

  if (typeof search === 'string' && search.trim()) {
    params.set('search', search.trim());
  }

  if (typeof city === 'string' && city.trim()) {
    params.set('city', city.trim());
  }

  return params.toString();
}

export async function listDeals({ limit = 12, page = 1, search = '', city = '', signal } = {}) {
  const queryString = createDealsQueryString({ limit, page, search, city });
  const payload = await requestJson(`/api/deals?${queryString}`, {
    signal,
  });

  return {
    items: Array.isArray(payload.data) ? payload.data.map(mapDealSummary) : [],
    pagination: payload.pagination || null,
  };
}

export async function getDealDetail(dealId, { signal } = {}) {
  const payload = await requestJson(`/api/deals/${encodeURIComponent(dealId)}`, {
    signal,
  });

  return mapDealDetail(payload.data);
}

export async function trackDealClick(dealId) {
  try {
    await fetch(createApiUrl(`/api/deals/${encodeURIComponent(dealId)}/click`), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      keepalive: true,
    });
  } catch {
    // Click tracking should never block the primary user action.
  }
}
