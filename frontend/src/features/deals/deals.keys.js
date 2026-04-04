const normalizeTextPart = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

export const dealsKeys = {
  all: ['deals'],
  lists: () => [...dealsKeys.all, 'list'],
  list: ({ limit = 12, city = '', search = '', sort = 'recent' } = {}) => [
    ...dealsKeys.lists(),
    limit,
    normalizeTextPart(city),
    normalizeTextPart(search),
    normalizeTextPart(sort) || 'recent',
  ],
  details: () => [...dealsKeys.all, 'detail'],
  detail: (dealId) => [...dealsKeys.details(), dealId],
  detailInvalid: (dealId) => [...dealsKeys.details(), 'invalid', dealId || ''],
  previews: () => [...dealsKeys.all, 'preview'],
  preview: (dealId) => [...dealsKeys.previews(), dealId],
};

export const isValidDealId = (dealId) =>
  typeof dealId === 'string' && /^[a-f\d]{24}$/i.test(dealId.trim());
