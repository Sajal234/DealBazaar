import { dealsKeys } from './deals.keys';
import { DEAL_PREVIEW_MAX_AGE_MS } from './deals.constants';
import { isPreviewEntry, isUsableDealPreview } from './deals.validation';

function getFreshPreviewData(queryClient, dealId) {
  const previewEntry = queryClient.getQueryData(dealsKeys.preview(dealId));

  if (!isPreviewEntry(previewEntry)) {
    return undefined;
  }

  if (Date.now() - previewEntry.cachedAt > DEAL_PREVIEW_MAX_AGE_MS) {
    return undefined;
  }

  return isUsableDealPreview(previewEntry.data) ? previewEntry.data : undefined;
}

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

      return {
        data: deal,
        cachedAt: fetchedAt,
      };
    });
  });
}

export function getDealPlaceholderData({ queryClient, dealId, initialDeal, canFetchDeal }) {
  if (!canFetchDeal) {
    return undefined;
  }

  const cachedDetail = queryClient.getQueryData(dealsKeys.detail(dealId));
  const freshPreview = getFreshPreviewData(queryClient, dealId);
  const safeInitialDeal = isUsableDealPreview(initialDeal) ? initialDeal : undefined;

  return freshPreview || safeInitialDeal || cachedDetail || undefined;
}
