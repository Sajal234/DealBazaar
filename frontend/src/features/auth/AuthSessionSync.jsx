import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '../admin/admin.queries';
import { storeKeys } from '../store/store.queries';
import { storeDealsKeys } from '../store/storeDeals.queries';
import { AUTH_SESSION_CHANGE_EVENT, AUTH_SESSION_STORAGE_KEY, readAuthSession } from './auth.session';
import { authKeys } from './auth.queries';

function isAuthStorageEvent(event) {
  return event.key === AUTH_SESSION_STORAGE_KEY || event.key === null;
}

export function AuthSessionSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncSessionState = () => {
      const session = readAuthSession();

      if (session?.token) {
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        return;
      }

      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.removeQueries({ queryKey: storeKeys.all });
      queryClient.removeQueries({ queryKey: storeDealsKeys.all });
      queryClient.removeQueries({ queryKey: adminKeys.all });
    };

    const handleStorage = (event) => {
      if (!isAuthStorageEvent(event)) {
        return;
      }

      syncSessionState();
    };

    const handleSessionChange = () => {
      syncSessionState();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleSessionChange);
    };
  }, [queryClient]);

  return null;
}
