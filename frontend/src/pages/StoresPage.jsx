import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, LoaderCircle, MapPin, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { DealsPagination } from '../features/deals/DealsPagination';
import { PublicStoreCard } from '../features/store/PublicStoreCard';
import { useStoresQuery } from '../features/store/store.queries';
import '../styles/stores.css';

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

export function StoresPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readStoreFilters(searchParams), [searchParams]);
  const [draftSearch, setDraftSearch] = useState(filters.search);
  const [draftCity, setDraftCity] = useState(filters.city);
  const { data, isLoading, error, refetch, isRefetching, isFetching } = useStoresQuery({
    limit: 12,
    page: filters.page,
    city: filters.city,
    search: filters.search,
  });

  const stores = data?.items || [];
  const pagination = data?.pagination || null;
  const totalPages = Math.max(1, pagination?.pages || 1);
  const currentPage = Math.min(Math.max(1, pagination?.page || filters.page), totalPages);

  useEffect(() => {
    setDraftSearch(filters.search);
  }, [filters.search]);

  useEffect(() => {
    setDraftCity(filters.city);
  }, [filters.city]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams(
      createStoreSearchParams({
        search: draftSearch,
        city: draftCity,
        page: 1,
      })
    );
  };

  const handleReset = () => {
    setDraftSearch('');
    setDraftCity('');
    setSearchParams(createStoreSearchParams({ search: '', city: '', page: 1 }));
  };

  return (
    <main className="page-shell page-shell--catalog">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Stores</p>
          <h1>Browse verified local stores.</h1>
          <p>Explore trusted retailers by city and open a dedicated store page before contacting or rating them.</p>
        </div>
      </section>

      <section className="stores-toolbar">
        <form className="stores-toolbar__form" onSubmit={handleSubmit}>
          <label className="filter-field">
            <span className="filter-field__label">Search</span>
            <div className="filter-field__control">
              <Search size={16} />
              <input
                type="search"
                value={draftSearch}
                onChange={(event) => {
                  setDraftSearch(event.target.value);
                }}
                placeholder="Search by store name"
              />
            </div>
          </label>

          <label className="filter-field">
            <span className="filter-field__label">City</span>
            <div className="filter-field__control">
              <MapPin size={16} />
              <input
                type="text"
                value={draftCity}
                onChange={(event) => {
                  setDraftCity(event.target.value);
                }}
                placeholder="Bengaluru"
              />
            </div>
          </label>

          <div className="stores-toolbar__actions">
            <button type="submit" className="button button--primary">
              Filter stores
            </button>
            <button type="button" className="button button--secondary" onClick={handleReset}>
              Clear
            </button>
          </div>
        </form>

        <div className="stores-toolbar__summary">
          <span>{pagination?.total || stores.length} verified stores</span>
          {filters.search ? <span>Search: {filters.search}</span> : null}
          {filters.city ? <span>City: {filters.city}</span> : <span>All cities</span>}
        </div>
      </section>

      {isLoading ? (
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Loading stores</h2>
            <p>Fetching approved local stores from the marketplace.</p>
          </div>
        </section>
      ) : null}

      {!isLoading && error ? (
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h2>Could not load stores</h2>
            <p>{error.message || 'Unable to load stores right now.'}</p>
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

      {!isLoading && !error && stores.length === 0 ? (
        <section className="state-card" aria-live="polite">
          <Search size={18} />
          <div>
            <h2>{filters.city ? 'No stores found for this city' : 'No verified stores yet'}</h2>
            <p>
              {filters.search || filters.city
                ? 'Try another store name or city to see verified retailers already listed.'
                : 'Verified stores will appear here as seller applications get approved.'}
            </p>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && stores.length > 0 ? (
        <section className="public-store-grid" aria-label="Verified stores">
          {stores.map((store) => (
            <PublicStoreCard key={store.id} store={store} />
          ))}
        </section>
      ) : null}

      {!isLoading && !error && (pagination?.total || 0) > 0 && totalPages > 1 ? (
        <DealsPagination
          page={currentPage}
          pages={totalPages}
          total={pagination?.total || stores.length}
          onPageChange={(nextPage) => {
            const safePage = Math.min(Math.max(1, nextPage), totalPages);

            if (safePage !== currentPage) {
              setSearchParams(
                createStoreSearchParams({
                  search: filters.search,
                  city: filters.city,
                  page: safePage,
                })
              );
            }
          }}
          isDisabled={isFetching}
        />
      ) : null}
    </main>
  );
}
