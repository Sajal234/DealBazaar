import { readAuthSession } from '../features/auth/auth.session';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(payload) {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0];

    if (firstError && typeof firstError.msg === 'string' && firstError.msg.trim()) {
      return firstError.msg;
    }
  }

  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  return 'Request failed';
}

export async function requestJson(path, options = {}) {
  const session = readAuthSession();
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await parseJson(response);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
}
