import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MaterialIcon, StitchBottomNav, StitchDesktopHeader, StitchMobileHeader } from '../components/StitchChrome';
import { StitchMediaFrame } from '../components/StitchDataVisuals';
import { createDealsSearchParams, hasDealsFilters, readDealsFilters } from '../features/deals/deals.filters';
import { DealsPagination } from '../features/deals/DealsPagination';
import { getSafeDealsPage } from '../features/deals/deals.pagination';
import { useDealsQuery } from '../features/deals/deals.queries';

function formatRelativeLabel(value, fallback = 'Fresh today') {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) {
    return 'Added just now';
  }

  if (diffHours < 24) {
    return `Added ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `Added ${diffDays}d ago`;
  }

  return fallback;
}

function DealsState({ title, description, actionLabel = '', onAction = null, tone = 'default' }) {
  return (
    <section className={`stitch-state-card${tone === 'error' ? ' stitch-state-card--error' : ''}`} aria-live="polite">
      <div className="stitch-state-card__icon">
        <MaterialIcon name={tone === 'error' ? 'warning' : 'search'} />
      </div>
      <div className="stitch-state-card__copy">
        <h2>{title}</h2>
        <p>{description}</p>
        {actionLabel && onAction ? (
          <button type="button" className="stitch-pill-button stitch-pill-button--primary" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function DealStoreLine({ deal }) {
  const storeName = deal.store?.name || 'Local store';

  if (deal.store?.id) {
    return (
      <Link to={`/stores/${deal.store.id}`} className="stitch-deal-card__store stitch-deal-card__store--link">
        <MaterialIcon name="storefront" className="stitch-deal-card__store-icon" />
        <span>{storeName}</span>
        {deal.store?.isVerified ? <MaterialIcon name="verified" filled className="stitch-deal-card__verified" /> : null}
      </Link>
    );
  }

  return (
    <div className="stitch-deal-card__store">
      <MaterialIcon name="storefront" className="stitch-deal-card__store-icon" />
      <span>{storeName}</span>
      {deal.store?.isVerified ? <MaterialIcon name="verified" filled className="stitch-deal-card__verified" /> : null}
    </div>
  );
}

function DesktopDealCard({ deal }) {
  const freshnessLabel = formatRelativeLabel(deal.updatedAt || deal.createdAt, 'Live now');

  return (
    <article className="stitch-deal-card stitch-deal-card--desktop">
      <Link to={`/deals/${deal.id}`} className="stitch-deal-card__media">
        <StitchMediaFrame
          src={deal.imageUrl}
          alt={deal.title}
          title={deal.title}
          subtitle={deal.store?.isVerified ? 'Verified local deal' : 'Local deal'}
          icon="sell"
        />
        {deal.store?.isVerified ? (
          <div className="stitch-deal-card__badge">
            <MaterialIcon name="verified" className="stitch-deal-card__badge-icon" />
            <span>Verified Seller</span>
          </div>
        ) : null}
      </Link>

      <div className="stitch-deal-card__body">
        <div className="stitch-deal-card__title-row">
          <div>
            <div className="stitch-deal-card__eyebrow">{freshnessLabel}</div>
            <h3>{deal.title}</h3>
          </div>
          <div className="stitch-deal-card__price">{deal.priceLabel}</div>
        </div>

        <p>{deal.description}</p>

        <DealStoreLine deal={deal} />

        <div className="stitch-deal-card__footer">
          <div className="stitch-deal-card__meta">
            <div>
              <MaterialIcon name="location_on" className="stitch-deal-card__meta-icon" />
              <span>{deal.cityLabel}</span>
            </div>
            <div>
              <MaterialIcon name="schedule" className="stitch-deal-card__meta-icon" />
              <span>{freshnessLabel}</span>
            </div>
          </div>

          <Link to={`/deals/${deal.id}`} className="stitch-action-button stitch-action-button--primary">
            View Deal
          </Link>
        </div>
      </div>
    </article>
  );
}

function MobileDealCard({ deal }) {
  return (
    <article className="stitch-deal-card stitch-deal-card--mobile">
      <Link to={`/deals/${deal.id}`} className="stitch-deal-card__mobile-media">
        <StitchMediaFrame
          src={deal.imageUrl}
          alt={deal.title}
          title={deal.title}
          subtitle={deal.store?.isVerified ? 'Verified local deal' : 'Local deal'}
          icon="sell"
        />
        <div className="stitch-deal-card__mobile-pill">
          <MaterialIcon
            name={deal.store?.isVerified ? 'verified' : 'sell'}
            className="stitch-deal-card__badge-icon"
          />
          <span>{deal.store?.isVerified ? 'Verified' : 'Live'}</span>
        </div>
      </Link>

      <div className="stitch-deal-card__mobile-body">
        <DealStoreLine deal={deal} />
        <h3>{deal.title}</h3>
        <p>{deal.description}</p>

        <div className="stitch-deal-card__mobile-footer">
          <div>
            <div className="stitch-deal-card__mobile-price">{deal.priceLabel}</div>
            <div className="stitch-deal-card__meta">
              <div>
                <MaterialIcon name="location_on" className="stitch-deal-card__meta-icon" />
                <span>{deal.cityLabel}</span>
              </div>
            </div>
          </div>
          <Link to={`/deals/${deal.id}`} className="stitch-action-button stitch-action-button--primary">
            View Deal
          </Link>
        </div>
      </div>
    </article>
  );
}

function DealsDesktopView({
  currentUser,
  draftSearch,
  draftCity,
  setDraftSearch,
  setDraftCity,
  filters,
  deals,
  isLoading,
  error,
  refetch,
  handleSubmit,
  handleReset,
  shouldShowPagination,
  pagination,
  currentPage,
  totalPages,
  handlePageChange,
}) {
  return (
    <div className="stitch-page stitch-page--desktop">
      <StitchDesktopHeader
        active="browse"
        currentUser={currentUser}
        searchValue={draftSearch}
        onSearchChange={setDraftSearch}
        searchPlaceholder="Search live deals..."
        showSearch
      />

      <main className="stitch-canvas stitch-canvas--deals">
        <div className="stitch-search-panel">
          <form className="stitch-search-panel__inner stitch-search-panel__inner--stores" onSubmit={handleSubmit}>
            <label className="stitch-search-field">
              <MaterialIcon name="search" className="stitch-search-field__icon" />
              <input
                type="search"
                value={draftSearch}
                onChange={(event) => {
                  setDraftSearch(event.target.value);
                }}
                placeholder="Search live deals..."
              />
            </label>

            <label className="stitch-search-field">
              <MaterialIcon name="location_on" className="stitch-search-field__icon" />
              <input
                type="text"
                value={draftCity}
                onChange={(event) => {
                  setDraftCity(event.target.value);
                }}
                placeholder="City"
              />
            </label>

            <div className="stitch-chip-row stitch-chip-row--wrap">
              <button type="submit" className="stitch-chip-button stitch-chip-button--active">
                Search
              </button>
              {hasDealsFilters(filters) ? (
                <button type="button" className="stitch-chip-button" onClick={handleReset}>
                  Clear
                </button>
              ) : null}
            </div>
          </form>

          {hasDealsFilters(filters) ? (
            <div className="stitch-active-filters" aria-label="Active filters">
              {filters.search ? <span className="stitch-active-filter">Search: {filters.search}</span> : null}
              {filters.city ? <span className="stitch-active-filter">City: {filters.city}</span> : null}
              {filters.storeId ? <span className="stitch-active-filter">Store: {filters.storeName || 'Selected store'}</span> : null}
            </div>
          ) : null}
        </div>

        <section className="stitch-section">
          <div className="stitch-section__header stitch-section__header--bordered">
            <div>
              <h2>{filters.storeId ? `Deals from ${filters.storeName || 'this store'}` : 'Live Deals'}</h2>
              <p>{pagination?.total || deals.length} approved offers currently visible.</p>
            </div>
          </div>

          {isLoading ? (
            <DealsState title="Loading live deals" description="Pulling the latest verified offers from the marketplace." />
          ) : null}

          {!isLoading && error ? (
            <DealsState
              tone="error"
              title="Could not load deals"
              description={error.message || 'Unable to load deals right now.'}
              actionLabel="Try Again"
              onAction={refetch}
            />
          ) : null}

          {!isLoading && !error && deals.length === 0 ? (
            <DealsState
              title={hasDealsFilters(filters) ? 'No deals match these filters' : 'No live deals yet'}
              description={
                hasDealsFilters(filters)
                  ? 'Try a broader search or clear the current filters to see more approved offers.'
                  : 'Approved offers will appear here as soon as stores publish them.'
              }
            />
          ) : null}

          {!isLoading && !error && deals.length > 0 ? (
            <div className="stitch-deals-grid" aria-label="Live deals">
              {deals.map((deal) => (
                <DesktopDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : null}

          {shouldShowPagination ? (
            <DealsPagination
              page={currentPage}
              pages={totalPages}
              total={pagination?.total || deals.length}
              onPageChange={handlePageChange}
            />
          ) : null}
        </section>
      </main>

      <StitchBottomNav active="explore" currentUser={currentUser} />
    </div>
  );
}

function DealsMobileView({
  currentUser,
  draftSearch,
  draftCity,
  setDraftSearch,
  setDraftCity,
  filters,
  deals,
  isLoading,
  error,
  refetch,
  handleSubmit,
  handleReset,
  shouldShowPagination,
  pagination,
  currentPage,
  totalPages,
  handlePageChange,
}) {
  return (
    <div className="stitch-page stitch-page--mobile">
      <StitchMobileHeader currentUser={currentUser}>
        <form className="stitch-mobile-search stitch-mobile-search--stacked" onSubmit={handleSubmit}>
          <label className="stitch-search-field stitch-search-field--mobile">
            <MaterialIcon name="search" className="stitch-search-field__icon" />
            <input
              type="search"
              value={draftSearch}
              onChange={(event) => {
                setDraftSearch(event.target.value);
              }}
              placeholder="Search live deals..."
            />
          </label>

          <label className="stitch-search-field stitch-search-field--mobile">
            <MaterialIcon name="location_on" className="stitch-search-field__icon" />
            <input
              type="text"
              value={draftCity}
              onChange={(event) => {
                setDraftCity(event.target.value);
              }}
              placeholder="City"
            />
          </label>

          <div className="stitch-chip-row stitch-chip-row--wrap">
            <button type="submit" className="stitch-chip-button stitch-chip-button--active">
              Search
            </button>
            {hasDealsFilters(filters) ? (
              <button type="button" className="stitch-chip-button" onClick={handleReset}>
                Clear
              </button>
            ) : null}
          </div>
        </form>
      </StitchMobileHeader>

      <main className="stitch-canvas stitch-canvas--mobile-deals">
        <section className="stitch-mobile-section-heading">
          <div>
            <h1>{filters.storeId ? filters.storeName || 'Store Deals' : 'Live Deals'}</h1>
            <p>{pagination?.total || deals.length} approved offers available.</p>
          </div>
        </section>

        {isLoading ? (
          <DealsState title="Loading live deals" description="Pulling the latest verified offers from the marketplace." />
        ) : null}

        {!isLoading && error ? (
          <DealsState
            tone="error"
            title="Could not load deals"
            description={error.message || 'Unable to load deals right now.'}
            actionLabel="Try Again"
            onAction={refetch}
          />
        ) : null}

        {!isLoading && !error && deals.length === 0 ? (
          <DealsState
            title={hasDealsFilters(filters) ? 'No matching deals' : 'No live deals yet'}
            description={
              hasDealsFilters(filters)
                ? 'Clear the current search to see more approved offers nearby.'
                : 'Approved offers will appear here once stores publish them.'
            }
          />
        ) : null}

        {!isLoading && !error && deals.length > 0 ? (
          <div className="stitch-mobile-deals-stack" aria-label="Live deals">
            {deals.map((deal) => (
              <MobileDealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : null}

        {shouldShowPagination ? (
          <DealsPagination
            page={currentPage}
            pages={totalPages}
            total={pagination?.total || deals.length}
            onPageChange={handlePageChange}
          />
        ) : null}
      </main>

      <StitchBottomNav active="explore" currentUser={currentUser} />
    </div>
  );
}

export function DealsPage({ currentUser = null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readDealsFilters(searchParams), [searchParams]);
  const [draftSearch, setDraftSearch] = useState(filters.search);
  const [draftCity, setDraftCity] = useState(filters.city);
  const { data, isLoading, error, refetch } = useDealsQuery({
    limit: 12,
    page: filters.page,
    search: filters.search,
    city: filters.city,
    storeId: filters.storeId,
  });
  const deals = data?.items || [];
  const pagination = data?.pagination || null;
  const totalPages = pagination?.pages || 1;
  const currentPage = getSafeDealsPage(pagination?.page ?? filters.page, totalPages);
  const shouldCanonicalizePage = !isLoading && !error && currentPage !== filters.page;
  const shouldShowPagination =
    !isLoading && !error && (pagination?.total || 0) > 0 && (totalPages > 1 || currentPage > 1);

  useEffect(() => {
    setDraftSearch(filters.search);
    setDraftCity(filters.city);
  }, [filters.city, filters.search]);

  useEffect(() => {
    if (!shouldCanonicalizePage) {
      return;
    }

    setSearchParams(
      createDealsSearchParams({
        search: filters.search,
        city: filters.city,
        storeId: filters.storeId,
        storeName: filters.storeName,
        page: currentPage,
      }),
      { replace: true }
    );
  }, [
    currentPage,
    filters.city,
    filters.page,
    filters.search,
    filters.storeId,
    filters.storeName,
    setSearchParams,
    shouldCanonicalizePage,
  ]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setSearchParams(
      createDealsSearchParams({
        search: draftSearch,
        city: draftCity,
        storeId: filters.storeId,
        storeName: filters.storeName,
        page: 1,
      })
    );
  };

  const handleReset = () => {
    setDraftSearch('');
    setDraftCity('');
    setSearchParams(
      createDealsSearchParams({
        storeId: filters.storeId,
        storeName: filters.storeName,
        page: 1,
      })
    );
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
    <>
      <DealsDesktopView
        currentUser={currentUser}
        draftSearch={draftSearch}
        draftCity={draftCity}
        setDraftSearch={setDraftSearch}
        setDraftCity={setDraftCity}
        filters={filters}
        deals={deals}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        handleSubmit={handleSubmit}
        handleReset={handleReset}
        shouldShowPagination={shouldShowPagination}
        pagination={pagination}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
      <DealsMobileView
        currentUser={currentUser}
        draftSearch={draftSearch}
        draftCity={draftCity}
        setDraftSearch={setDraftSearch}
        setDraftCity={setDraftCity}
        filters={filters}
        deals={deals}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        handleSubmit={handleSubmit}
        handleReset={handleReset}
        shouldShowPagination={shouldShowPagination}
        pagination={pagination}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </>
  );
}
