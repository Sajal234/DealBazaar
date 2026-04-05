import { readAuthSession } from '../features/auth/auth.session';

async function parseResponse(response) {
  try {
    const payload = await response.json();

    return {
      payload,
      rawText: '',
    };
  } catch {
    try {
      const rawText = await response.text();

      return {
        payload: null,
        rawText,
      };
    } catch {
      return {
        payload: null,
        rawText: '',
      };
    }
  }
}

function getErrorMessage(payload, rawText, response) {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0];

    if (firstError && typeof firstError.msg === 'string' && firstError.msg.trim()) {
      return firstError.msg;
    }
  }

  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof rawText === 'string' && rawText.trim()) {
    const normalizedText = rawText.trim().replace(/\s+/g, ' ');

    if (normalizedText.length <= 180) {
      return normalizedText;
    }
  }

  if (response?.status >= 500) {
    return 'Backend request failed. Make sure the API server is running and reachable.';
  }

  if (response?.status) {
    return `Request failed with status ${response.status}`;
  }

  return 'Request failed';
}

export async function requestJson(path, options = {}) {
  const session = readAuthSession();
  let response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    const networkError = new Error('Could not reach the backend API. Check that the backend server is running.');
    networkError.cause = error;
    throw networkError;
  }

  const { payload, rawText } = await parseResponse(response);

  if (!response.ok || !payload?.success) {
    const error = new Error(getErrorMessage(payload, rawText, response));
    error.status = response.status;
    throw error;
  }

  return payload;
}
