const allowedApprovalWindows = new Set(['24', '48', '72']);

function normalizePage(value) {
  const parsedValue = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function normalizeApprovalWindow(value) {
  if (typeof value !== 'string') {
    return '48';
  }

  const trimmedValue = value.trim();

  return allowedApprovalWindows.has(trimmedValue) ? trimmedValue : '48';
}

export function readAdminSearchParams(searchParams) {
  return {
    storesPage: normalizePage(searchParams.get('storesPage')),
    dealsPage: normalizePage(searchParams.get('dealsPage')),
    hours: normalizeApprovalWindow(searchParams.get('hours')),
  };
}

export function createAdminSearchParams({ storesPage = 1, dealsPage = 1, hours = '48' } = {}) {
  const params = new URLSearchParams();
  const normalizedStoresPage = normalizePage(storesPage);
  const normalizedDealsPage = normalizePage(dealsPage);
  const normalizedHours = normalizeApprovalWindow(hours);

  if (normalizedStoresPage > 1) {
    params.set('storesPage', String(normalizedStoresPage));
  }

  if (normalizedDealsPage > 1) {
    params.set('dealsPage', String(normalizedDealsPage));
  }

  if (normalizedHours !== '48') {
    params.set('hours', normalizedHours);
  }

  return params;
}
