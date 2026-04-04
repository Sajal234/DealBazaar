const normalizeTextPart = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

export const dealsKeys = {
  all: ['deals'],
  lists: () => [...dealsKeys.all, 'list'],
  list: ({ limit = 12, page = 1, city = '', search = '' } = {}) => [
    ...dealsKeys.lists(),
    limit,
    page,
    normalizeTextPart(city),
    normalizeTextPart(search),
  ],
  details: () => [...dealsKeys.all, 'detail'],
  detail: (dealId) => [...dealsKeys.details(), dealId],
  detailInvalid: (dealId) => [...dealsKeys.details(), 'invalid', dealId || ''],
  previews: () => [...dealsKeys.all, 'preview'],
  preview: (dealId) => [...dealsKeys.previews(), dealId],
};

export const isValidDealId = (dealId) =>
  typeof dealId === 'string' && /^[a-f\d]{24}$/i.test(dealId.trim());
