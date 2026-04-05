export const ownerDealStatusOptions = [
  { value: 'all', label: 'All deals' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Live' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

export function normalizeOwnerDealStatus(value) {
  if (typeof value !== 'string') {
    return 'all';
  }

  const normalizedValue = value.trim().toLowerCase();

  return ownerDealStatusOptions.some((option) => option.value === normalizedValue) ? normalizedValue : 'all';
}

export function getOwnerDealStatusLabel(value) {
  return ownerDealStatusOptions.find((option) => option.value === value)?.label || ownerDealStatusOptions[0].label;
}
