import { MapPin, Search, Store } from 'lucide-react';

function FilterChip({ icon: Icon, label, value, onClear }) {
  if (!value) {
    return null;
  }

  return (
    <button type="button" className="catalog-chip" onClick={onClear}>
      <Icon size={14} />
      <span className="catalog-chip__label">{label}:</span>
      <span className="catalog-chip__value">{value}</span>
      <span className="catalog-chip__remove" aria-hidden="true">
        ×
      </span>
    </button>
  );
}

export function DealsResultsHeader({
  filters,
  hasActiveFilters,
  pagination,
  dealsCount,
  onClearFilter,
}) {
  const total = pagination?.total ?? dealsCount;
  const page = pagination?.page ?? 1;
  const pages = pagination?.pages ?? 1;
  const hasStoreScope = Boolean(filters.storeId);
  const storeLabel = filters.storeName || 'Selected store';
  const title = hasStoreScope
    ? `Deals from ${storeLabel}`
    : hasActiveFilters
      ? 'Filtered marketplace view'
      : 'All live marketplace deals';

  return (
    <section className="catalog-resultsbar" aria-live="polite">
      <div className="catalog-resultsbar__copy">
        <p className="catalog-resultsbar__eyebrow">Results</p>
        <h2>{title}</h2>
        <div className="catalog-resultsbar__meta">
          <span>
            {total} result{total === 1 ? '' : 's'}
          </span>
          {pages > 1 ? <span>Page {page} of {pages}</span> : null}
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="catalog-resultsbar__filters">
          <FilterChip
            icon={Search}
            label="Search"
            value={filters.search}
            onClear={() => onClearFilter('search')}
          />
          <FilterChip
            icon={MapPin}
            label="City"
            value={filters.city}
            onClear={() => onClearFilter('city')}
          />
          <FilterChip
            icon={Store}
            label="Store"
            value={storeLabel}
            onClear={() => onClearFilter('store')}
          />
        </div>
      ) : null}
    </section>
  );
}
