import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsKeys } from '../deals/deals.keys';
import { storeKeys } from '../store/store.queries';
import { storeDealsKeys } from '../store/storeDeals.queries';
import {
  listActiveDeals,
  listApprovedStores,
  listPendingDeals,
  listPendingStores,
  removeActiveDeal,
  removeApprovedStore,
  updatePendingDealStatus,
  updatePendingStoreStatus,
} from './admin.api';

export const adminKeys = {
  all: ['admin'],
  stores: () => [...adminKeys.all, 'stores'],
  storeList: ({ page = 1, limit = 6 } = {}) => [...adminKeys.stores(), page, limit],
  approvedStores: () => [...adminKeys.all, 'approved-stores'],
  approvedStoreList: ({ page = 1, limit = 6 } = {}) => [...adminKeys.approvedStores(), page, limit],
  deals: () => [...adminKeys.all, 'deals'],
  dealList: ({ page = 1, limit = 6 } = {}) => [...adminKeys.deals(), page, limit],
  activeDeals: () => [...adminKeys.all, 'active-deals'],
  activeDealList: ({ page = 1, limit = 6 } = {}) => [...adminKeys.activeDeals(), page, limit],
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

export function useApprovedStoresQuery({ enabled, page = 1, limit = 6 } = {}) {
  return useQuery({
    queryKey: adminKeys.approvedStoreList({ page, limit }),
    queryFn: ({ signal }) => listApprovedStores({ page, limit, signal }),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useActiveDealsQuery({ enabled, page = 1, limit = 6 } = {}) {
  return useQuery({
    queryKey: adminKeys.activeDealList({ page, limit }),
    queryFn: ({ signal }) => listActiveDeals({ page, limit, signal }),
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
      queryClient.invalidateQueries({ queryKey: adminKeys.approvedStores() });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
    },
  });
}

export function useStoreRemovalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeApprovedStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.approvedStores() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stores() });
      queryClient.invalidateQueries({ queryKey: adminKeys.activeDeals() });
      queryClient.invalidateQueries({ queryKey: storeKeys.all });
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
    },
  });
}

export function useDealModerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePendingDealStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.deals() });
      queryClient.invalidateQueries({ queryKey: adminKeys.activeDeals() });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
    },
  });
}

export function useDealRemovalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeActiveDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.activeDeals() });
      queryClient.invalidateQueries({ queryKey: adminKeys.deals() });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
    },
  });
}
