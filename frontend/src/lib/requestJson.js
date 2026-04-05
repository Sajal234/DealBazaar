import { readAuthSession } from '../features/auth/auth.session';

const API_BASE_URL = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_URL || '').trim() : '';

function createApiUrl(path) {
  if (typeof path !== 'string' || !path.trim()) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function parseResponse(response) {
  const clonedResponse = response.clone();
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const payload = await response.json();

      return {
        payload,
        rawText: '',
        contentType,
      };
    } catch {
      // Fall through to text parsing below so we can surface the raw failure.
    }
  }

  try {
    const rawText = await clonedResponse.text();
    let payload = null;

    if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = null;
      }
    }

    return {
      payload,
      rawText,
      contentType,
    };
  } catch {
    return {
      payload: null,
      rawText: '',
      contentType,
    };
  }
}

function getErrorMessage(payload, rawText, response, contentType) {
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0];

    if (firstError && typeof firstError.msg === 'string' && firstError.msg.trim()) {
      return firstError.msg;
    }
  }

  if (payload && typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (contentType.includes('text/html') || /<!doctype html>|<html/i.test(rawText)) {
    return 'The frontend received an HTML page instead of API JSON. Restart the frontend after changing VITE_API_URL, and make sure the backend is running on the expected port.';
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

  if (response?.ok) {
    return 'The frontend received an unexpected response from the server. Restart the frontend after environment changes and make sure VITE_API_URL points to the backend API.';
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
    response = await fetch(createApiUrl(path), {
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

  const { payload, rawText, contentType } = await parseResponse(response);

  if (!response.ok || !payload?.success) {
    const error = new Error(getErrorMessage(payload, rawText, response, contentType));
    error.status = response.status;
    throw error;
  }

  return payload;
}

export { createApiUrl };
