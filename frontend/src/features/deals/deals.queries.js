import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDealDetail, listDeals } from './deals.api';
import { getDealPlaceholderData, seedDealPreviewCache } from './deals.cache';
import { dealsKeys, isValidDealId } from './deals.keys';

export function useDealsQuery({ limit = 12 } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dealsKeys.list({ limit }),
    queryFn: ({ signal }) => listDeals({ limit, signal }),
  });

  useEffect(() => {
    if (!query.data?.items) {
      return;
    }

    seedDealPreviewCache(queryClient, query.data.items);
  }, [query.data?.items, queryClient]);

  return query;
}

export function useDealDetailQuery(dealId, initialDeal) {
  const queryClient = useQueryClient();
  const canFetchDeal = isValidDealId(dealId);

  return useQuery({
    queryKey: dealsKeys.detail(dealId),
    queryFn: ({ signal }) => getDealDetail(dealId, { signal }),
    enabled: canFetchDeal,
    placeholderData: () =>
      getDealPlaceholderData({
        queryClient,
        dealId,
        initialDeal,
        canFetchDeal,
      }),
  });
}
