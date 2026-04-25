import { useEffect, useState } from 'react';

export const AUTH_SESSION_STORAGE_KEY = 'dealgrab.auth-session';
export const AUTH_SESSION_CHANGE_EVENT = 'dealgrab:auth-session-change';

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

function isAuthStorageEvent(event) {
  return event.key === AUTH_SESSION_STORAGE_KEY || event.key === null;
}

export function useAuthSessionState() {
  const [session, setSession] = useState(() => readAuthSession());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncSession = () => {
      setSession(readAuthSession());
    };

    const handleStorage = (event) => {
      if (!isAuthStorageEvent(event)) {
        return;
      }

      syncSession();
    };

    const handleSessionChange = () => {
      syncSession();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
    };
  }, []);

  return session;
}
