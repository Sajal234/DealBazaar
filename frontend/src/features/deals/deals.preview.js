import { DEAL_PREVIEW_MAX_AGE_MS } from './deals.constants';
import { isPreviewEntry, isUsableDealPreview } from './deals.validation';

export function createDealPreviewEntry(deal, cachedAt) {
  return {
    data: deal,
    cachedAt: typeof cachedAt === 'number' && cachedAt > 0 ? cachedAt : Date.now(),
  };
}

function getFreshDealPreviewEntry(previewEntry) {
  if (!isPreviewEntry(previewEntry)) {
    return undefined;
  }

  if (Date.now() - previewEntry.cachedAt > DEAL_PREVIEW_MAX_AGE_MS) {
    return undefined;
  }

  if (!isUsableDealPreview(previewEntry.data)) {
    return undefined;
  }

  return previewEntry;
}

export function getFreshDealPreviewData(previewEntry) {
  const freshEntry = getFreshDealPreviewEntry(previewEntry);

  return freshEntry ? freshEntry.data : undefined;
}

export function resolveFreshDealPreviewData(...previewEntries) {
  const freshestEntry = previewEntries.reduce((currentBest, candidate) => {
    const freshCandidate = getFreshDealPreviewEntry(candidate);

    if (!freshCandidate) {
      return currentBest;
    }

    if (!currentBest || freshCandidate.cachedAt > currentBest.cachedAt) {
      return freshCandidate;
    }

    return currentBest;
  }, undefined);

  return freshestEntry ? freshestEntry.data : undefined;
}
