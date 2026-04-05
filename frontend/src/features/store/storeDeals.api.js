import { requestJson } from '../../lib/requestJson';
import { normalizeOwnerDealStatus } from './storeDeals.filters';
import { mapOwnedDeal } from './storeDeals.mappers';

function createOwnerDealsQueryString({ limit = 6, page = 1, status = 'all' } = {}) {
  const params = new URLSearchParams();

  params.set('limit', String(limit));
  params.set('page', String(page));

   const normalizedStatus = normalizeOwnerDealStatus(status);

  if (normalizedStatus !== 'all') {
    params.set('status', normalizedStatus);
  }

  return params.toString();
}

export async function listMyDeals({ limit = 6, page = 1, status = 'all', signal } = {}) {
  const payload = await requestJson(`/api/deals/mine?${createOwnerDealsQueryString({ limit, page, status })}`, {
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

export async function createOwnedDeal({ productName, description, price, city, images = [] }) {
  const formData = new FormData();

  formData.append('productName', productName);
  formData.append('description', description);
  formData.append('price', price);

  if (typeof city === 'string' && city.trim()) {
    formData.append('city', city.trim());
  }

  images.forEach((image) => {
    formData.append('images', image);
  });

  const payload = await requestJson('/api/deals', {
    method: 'POST',
    body: formData,
  });

  return {
    deal: payload.data ? mapOwnedDeal(payload.data) : null,
    message: payload.message || 'Deal securely submitted. Pending admin approval.',
  };
}

export async function updateOwnedDeal({ dealId, updates }) {
  const payload = await requestJson(`/api/deals/${encodeURIComponent(dealId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return {
    deal: payload.data ? mapOwnedDeal(payload.data) : null,
    message: payload.message || 'Deal updated successfully.',
  };
}
