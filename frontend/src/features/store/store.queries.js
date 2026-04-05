import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applyForStore, getMyStore } from './store.api';

export const storeKeys = {
  all: ['store'],
  myStore: () => [...storeKeys.all, 'me'],
};

export function useMyStoreQuery({ enabled }) {
  return useQuery({
    queryKey: storeKeys.myStore(),
    queryFn: ({ signal }) => getMyStore({ signal }),
    enabled,
    retry: (failureCount, error) => error?.status !== 404 && failureCount < 1,
    staleTime: 60 * 1000,
  });
}

export function useApplyForStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyForStore,
    onSuccess: ({ store }) => {
      queryClient.setQueryData(storeKeys.myStore(), store);
    },
  });
}
