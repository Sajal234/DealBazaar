export const AUTH_SESSION_STORAGE_KEY = 'dealbazaar.auth-session';
export const AUTH_SESSION_CHANGE_EVENT = 'dealbazaar:auth-session-change';

function emitAuthSessionChange(session) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_CHANGE_EVENT, {
        detail: session || null,
      })
    );
  } catch {}
}

function isUsableAuthSession(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.token === 'string' &&
      value.token.trim() &&
      typeof value.email === 'string' &&
      value.email.trim()
  );
}

export function readAuthSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);

    return isUsableAuthSession(parsedSession) ? parsedSession : null;
  } catch {
    return null;
  }
}

export function persistAuthSession(session) {
  if (typeof window === 'undefined' || !isUsableAuthSession(session)) {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    emitAuthSessionChange(session);
  } catch {}
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    emitAuthSessionChange(null);
  } catch {}
}
