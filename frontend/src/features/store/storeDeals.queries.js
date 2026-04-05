import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsKeys } from '../deals/deals.keys';
import { archiveOwnedDeal, createOwnedDeal, listMyDeals, resubmitOwnedDeal, updateOwnedDeal } from './storeDeals.api';

export const storeDealsKeys = {
  all: ['store', 'deals'],
  list: ({ limit = 6, page = 1 } = {}) => [...storeDealsKeys.all, limit, page],
};

export function useMyDealsQuery({ enabled, limit = 6, page = 1 } = {}) {
  return useQuery({
    queryKey: storeDealsKeys.list({ limit, page }),
    queryFn: ({ signal }) => listMyDeals({ limit, page, signal }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useResubmitOwnedDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resubmitOwnedDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
    },
  });
}

export function useArchiveOwnedDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveOwnedDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
    },
  });
}

export function useCreateOwnedDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOwnedDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
    },
  });
}

export function useUpdateOwnedDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOwnedDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeDealsKeys.all });
      queryClient.invalidateQueries({ queryKey: dealsKeys.all });
    },
  });
}
