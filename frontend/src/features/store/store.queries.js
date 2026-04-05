import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsKeys } from '../deals/deals.keys';
import { applyForStore, getMyStore, getStoreById, listStores, resubmitStoreApplication, submitStoreRating } from './store.api';

export const storeKeys = {
  all: ['store'],
  lists: () => [...storeKeys.all, 'list'],
  list: ({ limit = 12, page = 1, city = '', search = '' } = {}) => [
    ...storeKeys.lists(),
    limit,
    page,
    city.trim().toLowerCase(),
    search.trim().toLowerCase(),
  ],
  details: () => [...storeKeys.all, 'detail'],
  detail: (storeId) => [...storeKeys.details(), storeId],
  myStore: () => [...storeKeys.all, 'me'],
};

export function useStoresQuery({ limit = 12, page = 1, city = '', search = '' } = {}) {
  return useQuery({
    queryKey: storeKeys.list({ limit, page, city, search }),
    queryFn: ({ signal }) => listStores({ limit, page, city, search, signal }),
    staleTime: 60 * 1000,
  });
}

export function useStoreDetailQuery({ storeId, enabled }) {
  return useQuery({
    queryKey: storeId ? storeKeys.detail(storeId) : [...storeKeys.details(), 'invalid'],
    queryFn: ({ signal }) => getStoreById(storeId, { signal }),
    enabled: enabled && typeof storeId === 'string' && storeId.trim().length > 0,
    retry: (failureCount, error) => error?.status !== 404 && failureCount < 1,
    staleTime: 60 * 1000,
  });
}

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

export function useResubmitStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resubmitStoreApplication,
    onSuccess: ({ store }) => {
      queryClient.setQueryData(storeKeys.myStore(), store);
    },
  });
}

export function useStoreRatingMutation(storeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rating) => submitStoreRating({ storeId, rating }),
    onSuccess: (result) => {
      queryClient.setQueryData(storeKeys.detail(storeId), (currentStore) => {
        if (!currentStore) {
          return currentStore;
        }

        return {
          ...currentStore,
          rating: Number.isFinite(Number(result?.rating)) ? Number(result.rating).toFixed(1) : currentStore.rating,
          totalRatings: Number.isFinite(Number(result?.totalRatings)) ? Number(result.totalRatings) : currentStore.totalRatings,
          myRating: Number.isFinite(Number(result?.myRating)) ? Number(result.myRating) : currentStore.myRating,
        };
      });

      queryClient.invalidateQueries({ queryKey: storeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
    },
  });
}
