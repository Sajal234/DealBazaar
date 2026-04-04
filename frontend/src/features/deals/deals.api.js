import { mapDealDetail, mapDealSummary } from './deals.mappers';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await parseJson(response);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}

export async function listDeals({ limit = 12, signal } = {}) {
  const payload = await requestJson(`/api/deals?limit=${encodeURIComponent(limit)}`, {
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
    await fetch(`/api/deals/${encodeURIComponent(dealId)}/click`, {
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
