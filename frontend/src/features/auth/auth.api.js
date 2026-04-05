import { requestJson } from '../../lib/requestJson';

export async function loginUser({ email, password }) {
  const payload = await requestJson('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return payload.data;
}

export async function getCurrentUser() {
  const payload = await requestJson('/api/auth/me');

  return payload.data;
}
