import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsKeys } from '../deals/deals.keys';
import { storeKeys } from '../store/store.queries';
import { storeDealsKeys } from '../store/storeDeals.queries';
import {
  listPendingDeals,
  listPendingStores,
  updatePendingDealStatus,
  updatePendingStoreStatus,
} from './admin.api';

export const adminKeys = {
  all: ['admin'],
  stores: () => [...adminKeys.all, 'stores'],
  storeList: ({ page = 1, limit = 6 } = {}) => [...adminKeys.stores(), page, limit],
  deals: () => [...adminKeys.all, 'deals'],
  dealList: ({ page = 1, limit = 6 } = {}) => [...adminKeys.deals(), page, limit],
};

export function usePendingStoresQuery({ enabled, page = 1, limit = 6 } = {}) {
  return useQuery({
    queryKey: adminKeys.storeList({ page, limit }),
    queryFn: ({ signal }) => listPendingStores({ page, limit, signal }),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function usePendingDealsQuery({ enabled, page = 1, limit = 6 } = {}) {
  return useQuery({
    queryKey: adminKeys.dealList({ page, limit }),
    queryFn: ({ signal }) => listPendingDeals({ page, limit, signal }),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useStoreModerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePendingStoreStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stores() });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}

export function useDealModerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePendingDealStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.deals() });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
    },
  });
}
