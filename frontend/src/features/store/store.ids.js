export function isValidStoreId(storeId) {
  return typeof storeId === 'string' && /^[a-f\d]{24}$/i.test(storeId.trim());
}
