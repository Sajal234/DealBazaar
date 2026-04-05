import { ownerDealStatusOptions } from './storeDeals.filters';

export function StoreDealsToolbar({ statusFilter, onStatusChange, total, page, pages, visibleCount }) {
  return (
    <div className="store-deals-toolbar">
      <div>
        <p className="store-card__eyebrow">Deal status</p>
        <div className="store-deals-toolbar__chips" role="tablist" aria-label="Filter your deals by status">
          {ownerDealStatusOptions.map((option) => {
            const isActive = option.value === statusFilter;

            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`store-deals-filter-chip${isActive ? ' store-deals-filter-chip--active' : ''}`}
                onClick={() => {
                  onStatusChange(option.value);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="store-deals-toolbar__summary" aria-live="polite">
        <span>{total} matching deals</span>
        <span>{visibleCount} on this page</span>
        {pages > 1 ? <span>Page {page} of {pages}</span> : null}
      </div>
    </div>
  );
}
