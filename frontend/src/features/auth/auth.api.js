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
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await parseJson(response);

  if (!response.ok || !payload?.success) {
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      throw new Error(payload.errors[0]?.msg || 'Request failed');
    }

    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
}

export async function loginUser({ email, password }) {
  const payload = await requestJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return payload.data;
}
