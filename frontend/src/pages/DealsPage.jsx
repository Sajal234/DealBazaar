import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, LoaderCircle, MapPin, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DealCard } from '../features/deals/DealCard';
import { DealsPagination } from '../features/deals/DealsPagination';
import {
  createDealsSearchParams,
  hasDealsFilters,
  readDealsFilters,
} from '../features/deals/deals.filters';
import { getSafeDealsPage } from '../features/deals/deals.pagination';
import { useDealsQuery } from '../features/deals/deals.queries';

export function DealsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readDealsFilters(searchParams), [searchParams]);
  const [draftFilters, setDraftFilters] = useState(filters);
  const hasActiveFilters = hasDealsFilters(filters);
  const { data, dataUpdatedAt, isLoading, error, refetch, isRefetching, isFetching } = useDealsQuery({
    limit: 12,
    page: filters.page,
    search: filters.search,
    city: filters.city,
  });
  const deals = data?.items || [];
  const pagination = data?.pagination || null;
  const totalPages = pagination?.pages || 1;
  const currentPage = getSafeDealsPage(pagination?.page ?? filters.page, totalPages);
  const shouldCanonicalizePage = !isLoading && !error && currentPage !== filters.page;
  const shouldShowPagination =
    !isLoading && !error && (pagination?.total || 0) > 0 && (totalPages > 1 || currentPage > 1);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (!shouldCanonicalizePage) {
      return;
    }

    setSearchParams(
      createDealsSearchParams({
        search: filters.search,
        city: filters.city,
        page: currentPage,
      }),
      { replace: true }
    );
  }, [currentPage, filters.city, filters.page, filters.search, setSearchParams, shouldCanonicalizePage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams(
      createDealsSearchParams({
        ...draftFilters,
        page: 1,
      })
    );
  };

  const handleReset = () => {
    const clearedFilters = { search: '', city: '', page: 1 };

    setDraftFilters(clearedFilters);
    setSearchParams(createDealsSearchParams(clearedFilters));
  };

  const handlePageChange = (nextPage) => {
    const safePage = getSafeDealsPage(nextPage, totalPages);

    if (safePage === currentPage) {
      return;
    }

    setSearchParams(
      createDealsSearchParams({
        ...filters,
        page: safePage,
      })
    );
  };

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Marketplace</p>
          <h1>Verified deals, filtered the way people actually browse.</h1>
          <p>
            Search across current listings or narrow by city. The URL updates with your filters, so
            this page is now a real browsable entry point into the marketplace.
          </p>
        </div>
      </section>

      <section className="deals-toolbar" aria-label="Deals filters">
        <form className="deals-filters" onSubmit={handleSubmit}>
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

          <div className="deals-filters__actions">
            <button type="submit" className="button button--primary">
              Apply filters
            </button>
            {hasActiveFilters ? (
              <button type="button" className="button button--secondary" onClick={handleReset}>
                Clear
              </button>
            ) : null}
          </div>
        </form>

        <p className="deals-toolbar__summary">
          {hasActiveFilters
            ? `Showing ${pagination?.total ?? deals.length} live deal${(pagination?.total ?? deals.length) === 1 ? '' : 's'} for the current filter set.`
            : `Showing ${pagination?.total ?? deals.length} live deal${(pagination?.total ?? deals.length) === 1 ? '' : 's'} across the marketplace.`}
        </p>
      </section>

      {isLoading ? (
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Loading live deals</h2>
            <p>Pulling the latest verified offers from the marketplace.</p>
          </div>
        </section>
      ) : null}

      {!isLoading && error ? (
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h2>Could not load deals</h2>
            <p>{error.message || 'Unable to load deals right now.'}</p>
            <button
              type="button"
              className="button button--secondary state-card__retry"
              onClick={() => {
                refetch();
              }}
              disabled={isRefetching}
            >
              {isRefetching ? 'Retrying...' : 'Try again'}
            </button>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && deals.length === 0 ? (
        <section className="state-card" aria-live="polite">
          <Search size={18} />
          <div>
            <h2>{hasActiveFilters ? 'No deals match these filters' : 'No live deals yet'}</h2>
            <p>
              {hasActiveFilters
                ? 'Try a broader search or clear the city filter to see more approved offers.'
                : 'Approved offers will appear here as soon as stores publish them.'}
            </p>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && deals.length > 0 ? (
        <section className="deal-grid" aria-label="Live deals">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} previewTimestamp={dataUpdatedAt} />
          ))}
        </section>
      ) : null}

      {shouldShowPagination ? (
        <DealsPagination
          page={currentPage}
          pages={totalPages}
          total={pagination?.total || deals.length}
          onPageChange={handlePageChange}
          isDisabled={isFetching}
        />
      ) : null}
    </main>
  );
}
