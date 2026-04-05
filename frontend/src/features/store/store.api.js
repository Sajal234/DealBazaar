import { requestJson } from '../../lib/requestJson';
import { mapStore } from './store.mappers';

function createStoresQueryString({ limit = 12, page = 1, city = '', search = '' } = {}) {
  const params = new URLSearchParams();

  params.set('limit', String(limit));
  params.set('page', String(page));

  if (typeof city === 'string' && city.trim()) {
    params.set('city', city.trim());
  }

  if (typeof search === 'string' && search.trim()) {
    params.set('search', search.trim());
  }

  return params.toString();
}

export async function listStores({ limit = 12, page = 1, city = '', search = '', signal } = {}) {
  const payload = await requestJson(`/api/stores?${createStoresQueryString({ limit, page, city, search })}`, { signal });

  return {
    items: Array.isArray(payload.data) ? payload.data.map(mapStore) : [],
    pagination: payload.pagination || null,
  };
}

export async function getStoreById(storeId, { signal } = {}) {
  const payload = await requestJson(`/api/stores/${encodeURIComponent(storeId)}`, { signal });

  return mapStore(payload.data);
}

export async function getMyStore({ signal } = {}) {
  const payload = await requestJson('/api/stores/me', { signal });

  return mapStore(payload.data);
}

export async function applyForStore(input) {
  const payload = await requestJson('/api/stores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return {
    store: mapStore(payload.data),
    message: payload.message || 'Store application submitted successfully.',
  };
}

export async function resubmitStoreApplication(input) {
  const payload = await requestJson('/api/stores/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return {
    store: mapStore(payload.data),
    message: payload.message || 'Store application updated and resubmitted for review.',
  };
}

export async function submitStoreRating({ storeId, rating }) {
  const payload = await requestJson(`/api/stores/${encodeURIComponent(storeId)}/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rating }),
  });

  return payload.data;
}
