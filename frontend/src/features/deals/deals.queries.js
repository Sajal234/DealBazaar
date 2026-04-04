import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDealDetail, listDeals } from './deals.api';

export function useDealsQuery({ limit = 12 } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['deals', 'list', limit],
    queryFn: ({ signal }) => listDeals({ limit, signal }),
  });

  useEffect(() => {
    if (!query.data?.items) {
      return;
    }

    query.data.items.forEach((deal) => {
      queryClient.setQueryData(['deals', 'detail', deal.id], (existingDeal) => existingDeal || deal);
    });
  }, [query.data?.items, queryClient]);

  return query;
}

export function useDealDetailQuery(dealId, initialDeal) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['deals', 'detail', dealId],
    queryFn: ({ signal }) => getDealDetail(dealId, { signal }),
    enabled: Boolean(dealId),
    placeholderData: () => initialDeal || queryClient.getQueryData(['deals', 'detail', dealId]),
  });
}
