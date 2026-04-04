import { dealsKeys } from './deals.keys';
import { createDealPreviewEntry, resolveFreshDealPreviewData } from './deals.preview';
import { isPreviewEntry } from './deals.validation';

export function seedDealPreviewCache(queryClient, deals, fetchedAt) {
  if (!Array.isArray(deals)) {
    return;
  }

  deals.forEach((deal) => {
    if (!deal?.id) {
      return;
    }

    queryClient.setQueryData(dealsKeys.preview(deal.id), (existingEntry) => {
      if (isPreviewEntry(existingEntry) && existingEntry.cachedAt > fetchedAt) {
        return existingEntry;
      }

      return createDealPreviewEntry(deal, fetchedAt);
    });
  });
}

export function getDealPlaceholderData({ queryClient, dealId, initialDealEntry, canFetchDeal }) {
  if (!canFetchDeal) {
    return undefined;
  }

  const cachedDetail = queryClient.getQueryData(dealsKeys.detail(dealId));
  const previewData = resolveFreshDealPreviewData(
    initialDealEntry,
    queryClient.getQueryData(dealsKeys.preview(dealId))
  );

  return previewData || cachedDetail || undefined;
}
