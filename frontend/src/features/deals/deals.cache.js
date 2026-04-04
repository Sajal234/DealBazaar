import { dealsKeys } from './deals.keys';

export function seedDealPreviewCache(queryClient, deals) {
  if (!Array.isArray(deals)) {
    return;
  }

  deals.forEach((deal) => {
    if (!deal?.id) {
      return;
    }

    queryClient.setQueryData(dealsKeys.preview(deal.id), deal);
  });
}

export function getDealPlaceholderData({ queryClient, dealId, initialDeal, canFetchDeal }) {
  if (!canFetchDeal) {
    return undefined;
  }

  return (
    queryClient.getQueryData(dealsKeys.detail(dealId)) ||
    initialDeal ||
    queryClient.getQueryData(dealsKeys.preview(dealId)) ||
    undefined
  );
}
