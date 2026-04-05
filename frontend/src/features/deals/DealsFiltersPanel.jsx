import { MapPin, Search } from 'lucide-react';

export function DealsFiltersPanel({
  draftFilters,
  setDraftFilters,
  hasActiveFilters,
  activeFilterCount,
  hasDraftChanges,
  onSubmit,
  onReset,
}) {
  return (
    <aside className="catalog-sidebar">
      <form className="catalog-filter-panel" onSubmit={onSubmit} aria-label="Deals filters">
        <div className="catalog-filter-panel__header">
          <p className="catalog-filter-panel__eyebrow">
            Filters{activeFilterCount > 0 ? ` • ${activeFilterCount} active` : ''}
          </p>
          <h2>Refine your results</h2>
        </div>

        <label className="filter-field">
          <span className="filter-field__label">Search</span>
          <div className="filter-field__control">
            <Search size={16} />
            <input
              type="search"
              name="search"
              value={draftFilters.search}
              onChange={(event) => {
                setDraftFilters((currentFilters) => ({
                  ...currentFilters,
                  search: event.target.value,
                }));
              }}
              placeholder="Search deals or products"
              autoComplete="off"
            />
          </div>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">City</span>
          <div className="filter-field__control">
            <MapPin size={16} />
            <input
              type="text"
              name="city"
              value={draftFilters.city}
              onChange={(event) => {
                setDraftFilters((currentFilters) => ({
                  ...currentFilters,
                  city: event.target.value,
                }));
              }}
              placeholder="Enter a city"
              autoComplete="off"
            />
          </div>
        </label>

        <div className="catalog-filter-panel__actions">
          <button type="submit" className="button button--primary" disabled={!hasDraftChanges}>
            Apply filters
          </button>
          {hasActiveFilters || hasDraftChanges ? (
            <button type="button" className="button button--secondary" onClick={onReset}>
              Clear filters
            </button>
          ) : null}
        </div>
      </form>
    </aside>
  );
}
