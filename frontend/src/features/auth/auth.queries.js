import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { changePassword, getCurrentUser } from './auth.api';
import { clearAuthSession, persistAuthSession, readAuthSession } from './auth.session';

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

export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (session) => {
      persistAuthSession(session);
      queryClient.setQueryData(authKeys.currentUser(), {
        _id: session._id,
        name: session.name,
        email: session.email,
        role: session.role,
      });
    },
  });
}
