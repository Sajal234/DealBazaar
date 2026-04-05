import { MapPin, Search } from 'lucide-react';

function FilterChip({ icon: Icon, label, value }) {
  if (!value) {
    return null;
  }

  return (
    <span className="catalog-chip">
      <Icon size={14} />
      <span className="catalog-chip__label">{label}:</span>
      <span className="catalog-chip__value">{value}</span>
    </span>
  );
}

export function DealsResultsHeader({ filters, hasActiveFilters, pagination, dealsCount }) {
  const total = pagination?.total ?? dealsCount;
  const page = pagination?.page ?? 1;
  const pages = pagination?.pages ?? 1;

  return (
    <section className="catalog-resultsbar" aria-live="polite">
      <div className="catalog-resultsbar__copy">
        <p className="catalog-resultsbar__eyebrow">Results</p>
        <h2>{hasActiveFilters ? 'Filtered marketplace view' : 'All live marketplace deals'}</h2>
        <div className="catalog-resultsbar__meta">
          <span>
            {total} result{total === 1 ? '' : 's'}
          </span>
          {pages > 1 ? <span>Page {page} of {pages}</span> : null}
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="catalog-resultsbar__filters">
          <FilterChip icon={Search} label="Search" value={filters.search} />
          <FilterChip icon={MapPin} label="City" value={filters.city} />
        </div>
      ) : null}
    </section>
  );
}
