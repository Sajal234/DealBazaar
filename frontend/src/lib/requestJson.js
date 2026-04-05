import { clearAuthSession, readAuthSession } from '../features/auth/auth.session';

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

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function createApiCandidates(path) {
  const candidates = [];
  const normalizedPath = typeof path === 'string' && path.startsWith('/') ? path : `/${path}`;

  if (/^https?:\/\//i.test(path)) {
    return [path];
  }

  if (API_BASE_URL) {
    candidates.push(createApiUrl(path));
  } else {
    candidates.push(path);
  }

  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname } = window.location;

    if (origin) {
      candidates.push(`${origin}${normalizedPath}`);
    }

    if (isLocalHostname(hostname)) {
      candidates.push(`http://localhost:5050${normalizedPath}`);
      candidates.push(`http://127.0.0.1:5050${normalizedPath}`);
    }
  }

  return Array.from(new Set(candidates.filter(Boolean)));
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
    return 'We could not complete this request right now. Please try again in a moment.';
  }

  if (typeof rawText === 'string' && rawText.trim()) {
    const normalizedText = rawText.trim().replace(/\s+/g, ' ');

    if (normalizedText.length <= 180) {
      return normalizedText;
    }
  }

  if (response?.status >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }

  if (response?.ok) {
    return 'We received an unexpected response from the server. Please try again in a moment.';
  }

  if (response?.status) {
    return `Request failed with status ${response.status}`;
  }

  return 'We could not complete this request right now. Please try again.';
}

function getPayloadMessage(payload) {
  if (payload && typeof payload.message === 'string') {
    return payload.message.trim();
  }

  return '';
}

function shouldClearSavedSession({ response, payload, session }) {
  if (!session?.token || response?.status !== 401) {
    return false;
  }

  const message = getPayloadMessage(payload);

  return [
    'Invalid token format',
    'Not authorized, user no longer exists',
    'Not authorized, token expired after password change',
    'Not authorized, token failed',
    'Not authorized, no token provided',
  ].includes(message);
}

function shouldRetryWithAnotherCandidate({ response, payload, rawText, contentType, error }) {
  if (error) {
    return true;
  }

  if (!response) {
    return true;
  }

  if (contentType.includes('text/html') || /<!doctype html>|<html/i.test(rawText)) {
    return true;
  }

  if (response.ok && !payload?.success) {
    return true;
  }

  return false;
}

function isAbortError(error) {
  return Boolean(error && typeof error === 'object' && error.name === 'AbortError');
}

export async function requestJson(path, options = {}) {
  const session = readAuthSession();
  const requestHeaders = {
    Accept: 'application/json',
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...options.headers,
  };
  const apiCandidates = createApiCandidates(path);
  let lastError = null;

  for (const candidate of apiCandidates) {
    let response;

    try {
      response = await fetch(candidate, {
        ...options,
        headers: requestHeaders,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      lastError = error;

      if (shouldRetryWithAnotherCandidate({ error }) && candidate !== apiCandidates[apiCandidates.length - 1]) {
        continue;
      }

      const networkError = new Error('We could not reach the service right now. Please try again in a moment.');
      networkError.cause = error;
      throw networkError;
    }

    const { payload, rawText, contentType } = await parseResponse(response);

    if (response.ok && payload?.success) {
      return payload;
    }

    const shouldRetry =
      shouldRetryWithAnotherCandidate({ response, payload, rawText, contentType }) &&
      candidate !== apiCandidates[apiCandidates.length - 1];

    if (shouldRetry) {
      continue;
    }

    if (shouldClearSavedSession({ response, payload, session })) {
      clearAuthSession();
    }

    const error = new Error(getErrorMessage(payload, rawText, response, contentType));
    error.status = response.status;
    throw error;
  }

  const fallbackError = new Error('We could not reach the service right now. Please try again in a moment.');
  fallbackError.cause = lastError;
  throw fallbackError;
}

export { createApiUrl };
