import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from './auth.api';
import { clearAuthSession, readAuthSession } from './auth.session';

export const authKeys = {
  all: ['auth'],
  currentUser: () => [...authKeys.all, 'me'],
};

export function useCurrentUserQuery() {
  const queryClient = useQueryClient();
  const hasToken = Boolean(readAuthSession()?.token);

  const query = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: () => getCurrentUser(),
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.error?.status !== 401) {
      return;
    }

    clearAuthSession();
    queryClient.removeQueries({ queryKey: authKeys.all });
  }, [query.error, queryClient]);

  return query;
}
