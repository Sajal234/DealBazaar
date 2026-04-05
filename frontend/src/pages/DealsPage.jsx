import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, LoaderCircle, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DealCard } from '../features/deals/DealCard';
import { DealsFiltersPanel } from '../features/deals/DealsFiltersPanel';
import { DealsPagination } from '../features/deals/DealsPagination';
import { DealsResultsHeader } from '../features/deals/DealsResultsHeader';
import {
  areDealsFiltersEqual,
  countActiveDealsFilters,
  removeDealsFilter,
} from '../features/deals/deals.filterState';
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
  const activeFilterCount = countActiveDealsFilters(filters);
  const hasDraftChanges = !areDealsFiltersEqual(draftFilters, filters);
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

  const handleClearFilter = (key) => {
    const nextFilters = removeDealsFilter(filters, key);

    setDraftFilters(nextFilters);
    setSearchParams(createDealsSearchParams(nextFilters));
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
    <main className="page-shell page-shell--catalog">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Marketplace</p>
          <h1>Browse verified local deals.</h1>
          <p>Search products, narrow by city, and move through the catalog the way shoppers expect.</p>
        </div>
      </section>

      <section className="catalog-layout">
        <DealsFiltersPanel
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          hasDraftChanges={hasDraftChanges}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />

        <div className="catalog-main">
          <DealsResultsHeader
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            pagination={pagination}
            dealsCount={deals.length}
            onClearFilter={handleClearFilter}
          />

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
        </div>
      </section>
    </main>
  );
}
