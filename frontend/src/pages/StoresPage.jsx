import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MaterialIcon, StitchBottomNav, StitchDesktopHeader, StitchMobileHeader } from '../components/StitchChrome';
import { StitchAvatar } from '../components/StitchDataVisuals';
import { DealsPagination } from '../features/deals/DealsPagination';
import { useStoresQuery } from '../features/store/store.queries';

function readStoreFilters(searchParams) {
  const search = (searchParams.get('search') || '').trim();
  const city = (searchParams.get('city') || '').trim();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);

  return { search, city, page };
}

function createStoreSearchParams({ search = '', city = '', page = 1 } = {}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search.trim());
  }

  if (city.trim()) {
    params.set('city', city.trim());
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  return params;
}

function StoresState({ title, description, tone = 'default' }) {
  return (
    <section className={`stitch-state-card${tone === 'error' ? ' stitch-state-card--error' : ''}`}>
      <div className="stitch-state-card__icon">
        <MaterialIcon name={tone === 'error' ? 'warning' : 'storefront'} />
      </div>
      <div className="stitch-state-card__copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}

function StoreListingCard({ store }) {
  return (
    <article className="stitch-store-listing-card">
      <div className="stitch-store-listing-card__media stitch-store-listing-card__media--avatar">
        <StitchAvatar label={store.name} size="xl" className="stitch-store-listing-card__avatar" />
      </div>

      <div className="stitch-store-listing-card__body">
        <div className="stitch-store-listing-card__heading">
          <h3>{store.name}</h3>
          {store.isVerified ? (
            <span className="stitch-status-pill">
              <MaterialIcon name="verified" filled className="stitch-status-pill__icon" />
              Verified
            </span>
          ) : null}
        </div>

        <p>{store.address || `${store.cityLabel}, ${store.stateLabel}`}</p>

        <div className="stitch-store-listing-card__meta">
          <span>{store.cityLabel}, {store.stateLabel}</span>
          <span>{store.rating ? `${store.rating} / 5` : 'No ratings yet'}</span>
        </div>

        <div className="stitch-store-listing-card__actions">
          {store.phone ? (
            <a href={`tel:${store.phone}`} className="stitch-action-button stitch-action-button--secondary">
              Call Store
            </a>
          ) : null}
          <Link to={`/stores/${store.id}`} className="stitch-action-button stitch-action-button--primary">
            View Store
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StoresPage({ currentUser = null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readStoreFilters(searchParams), [searchParams]);
  const [draftSearch, setDraftSearch] = useState(filters.search);
  const [draftCity, setDraftCity] = useState(filters.city);
  const { data, isLoading, error } = useStoresQuery({
    limit: 12,
    page: filters.page,
    city: filters.city,
    search: filters.search,
  });

  const stores = data?.items || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };
  const totalPages = Math.max(1, pagination.pages || 1);

  useEffect(() => {
    setDraftSearch(filters.search);
    setDraftCity(filters.city);
  }, [filters.city, filters.search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams(createStoreSearchParams({ search: draftSearch, city: draftCity, page: 1 }));
  };

  const handleReset = () => {
    setDraftSearch('');
    setDraftCity('');
    setSearchParams(createStoreSearchParams({ search: '', city: '', page: 1 }));
  };

  return (
    <>
      <div className="stitch-page stitch-page--desktop">
        <StitchDesktopHeader active="stores" currentUser={currentUser} />

        <main className="stitch-canvas stitch-canvas--stores">
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
                  placeholder="Search approved stores..."
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
                {(filters.search || filters.city) ? (
                  <button type="button" className="stitch-chip-button" onClick={handleReset}>
                    Clear
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <section className="stitch-section">
            <div className="stitch-section__header stitch-section__header--bordered">
              <div>
                <h2>Approved Stores</h2>
                <p>{pagination.total || stores.length} trusted local merchants currently listed.</p>
              </div>
            </div>

            {isLoading ? (
              <StoresState title="Loading stores" description="Fetching approved local stores from the marketplace." />
            ) : null}

            {!isLoading && error ? (
              <StoresState title="Could not load stores" description={error.message || 'Unable to load stores right now.'} tone="error" />
            ) : null}

            {!isLoading && !error && stores.length === 0 ? (
              <StoresState title="No approved stores yet" description="Approved stores will appear here as seller applications get reviewed." />
            ) : null}

            {!isLoading && !error && stores.length > 0 ? (
              <div className="stitch-store-listing-grid">
                {stores.map((store) => (
                  <StoreListingCard key={store.id} store={store} />
                ))}
              </div>
            ) : null}

            {pagination.pages > 1 ? (
              <DealsPagination
                page={pagination.page}
                pages={totalPages}
                total={pagination.total}
                onPageChange={(nextPage) => {
                  setSearchParams(createStoreSearchParams({ search: filters.search, city: filters.city, page: nextPage }));
                }}
              />
            ) : null}
          </section>
        </main>

        <StitchBottomNav active="stores" currentUser={currentUser} />
      </div>

      <div className="stitch-page stitch-page--mobile">
        <StitchMobileHeader currentUser={currentUser} />

        <main className="stitch-canvas stitch-canvas--stores">
          <form className="stitch-search-panel__inner stitch-search-panel__inner--stores" onSubmit={handleSubmit}>
            <label className="stitch-search-field">
              <MaterialIcon name="search" className="stitch-search-field__icon" />
              <input
                type="search"
                value={draftSearch}
                onChange={(event) => {
                  setDraftSearch(event.target.value);
                }}
                placeholder="Search stores..."
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
              {(filters.search || filters.city) ? (
                <button type="button" className="stitch-chip-button" onClick={handleReset}>
                  Clear
                </button>
              ) : null}
            </div>
          </form>

          {isLoading ? (
            <StoresState title="Loading stores" description="Fetching approved local stores from the marketplace." />
          ) : null}

          {!isLoading && error ? (
            <StoresState title="Could not load stores" description={error.message || 'Unable to load stores right now.'} tone="error" />
          ) : null}

          {!isLoading && !error && stores.length === 0 ? (
            <StoresState title="No approved stores yet" description="Approved stores will appear here as seller applications get reviewed." />
          ) : null}

          {!isLoading && !error && stores.length > 0 ? (
            <div className="stitch-store-listing-grid">
              {stores.map((store) => (
                <StoreListingCard key={store.id} store={store} />
              ))}
            </div>
          ) : null}

          {pagination.pages > 1 ? (
            <DealsPagination
              page={pagination.page}
              pages={totalPages}
              total={pagination.total}
              onPageChange={(nextPage) => {
                setSearchParams(createStoreSearchParams({ search: filters.search, city: filters.city, page: nextPage }));
              }}
            />
          ) : null}
        </main>

        <StitchBottomNav active="stores" currentUser={currentUser} />
      </div>
    </>
  );
}
