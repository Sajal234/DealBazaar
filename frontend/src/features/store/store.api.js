import { requestJson } from '../../lib/requestJson';
import { mapStore } from './store.mappers';

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
