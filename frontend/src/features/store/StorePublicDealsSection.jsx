import { AlertCircle, LoaderCircle, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DealCard } from '../deals/DealCard';
import { useDealsQuery } from '../deals/deals.queries';

export function StorePublicDealsSection({ storeId, storeName, cityLabel }) {
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useDealsQuery({
    limit: 6,
    page: 1,
    storeId,
  });

  const deals = data?.items || [];
  const total = data?.pagination?.total || deals.length;

  return (
    <section className="store-public-deals" aria-labelledby="store-live-deals-title">
      <div className="store-public-deals__header">
        <div>
          <p className="store-public-deals__eyebrow">Live deals</p>
          <h2 id="store-live-deals-title">Current offers from {storeName}</h2>
          <p>{total > 0 ? `${total} active offer${total === 1 ? '' : 's'} currently visible.` : 'No active offers are visible from this store right now.'}</p>
        </div>
        <Link
          to={`/deals?storeId=${encodeURIComponent(storeId)}&store=${encodeURIComponent(storeName)}`}
          className="button button--secondary"
        >
          View all store deals
        </Link>
      </div>

      {isLoading ? (
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h3>Loading store deals</h3>
            <p>Fetching this store&apos;s latest active offers.</p>
          </div>
        </section>
      ) : null}

      {!isLoading && error ? (
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h3>Could not load live deals</h3>
            <p>{error.message || 'Please try again in a moment.'}</p>
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
        <section className="state-card store-public-deals__empty" aria-live="polite">
          <Tag size={18} />
          <div>
            <h3>No live deals yet</h3>
            <p>This store profile is active, but there are no shopper-facing deals visible at the moment.</p>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && deals.length > 0 ? (
        <div className="store-public-deals__grid" aria-label={`Active deals from ${storeName}`}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} previewTimestamp={dataUpdatedAt} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
