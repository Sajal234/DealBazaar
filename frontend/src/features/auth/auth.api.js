import { requestJson } from '../../lib/requestJson';

export async function signupUser({ name, email, password }) {
  const payload = await requestJson('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  return payload.data;
}

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

export async function loginWithGoogle({ credential }) {
  const payload = await requestJson('/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credential,
    }),
  });

  return payload.data;
}

export async function getCurrentUser() {
  const payload = await requestJson('/api/auth/me');

  return payload.data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const payload = await requestJson('/api/auth/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  return payload.data;
}

export async function requestPasswordReset({ email }) {
  const payload = await requestJson('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  return {
    message: payload.message,
    debugResetPath: payload.data?.debugResetPath || '',
  };
}

export async function resetPasswordWithToken({ token, password }) {
  const payload = await requestJson(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  return payload.data;
}
