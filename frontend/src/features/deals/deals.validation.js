export const isPreviewEntry = (value) =>
  Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value.data &&
      typeof value.cachedAt === 'number'
  );

export const isUsableDealPreview = (value) =>
  Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof value.id === 'string' &&
      typeof value.title === 'string' &&
      typeof value.priceLabel === 'string' &&
      typeof value.cityLabel === 'string'
  );
