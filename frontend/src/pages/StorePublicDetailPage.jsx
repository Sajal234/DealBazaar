import { AlertCircle, ArrowLeft, BadgeCheck, LoaderCircle, MapPin, Phone, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ResourceNotFoundState } from '../components/ResourceNotFoundState';
import { isValidStoreId } from '../features/store/store.ids';
import { StorePublicDealsSection } from '../features/store/StorePublicDealsSection';
import { StoreRatingPanel } from '../features/store/StoreRatingPanel';
import { useStoreDetailQuery } from '../features/store/store.queries';
import '../styles/stores.css';

export function StorePublicDetailPage({ currentUser }) {
  const { storeId } = useParams();
  const hasValidStoreId = isValidStoreId(storeId);
  const { data: store, isLoading, error, refetch, isRefetching } = useStoreDetailQuery({
    storeId,
    enabled: hasValidStoreId,
  });

  if (!hasValidStoreId) {
    return (
      <ResourceNotFoundState
        title="Invalid store link"
        message="The store address is malformed or no longer available."
        backTo="/stores"
        backLabel="Back to stores"
        secondaryTo="/deals"
        secondaryLabel="Browse deals"
      />
    );
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Loading store details</h2>
            <p>Fetching the latest public store information.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error?.status === 404) {
    return (
      <ResourceNotFoundState
        title="This store is no longer available"
        message="The store may have been removed or this link may be outdated."
        backTo="/stores"
        backLabel="Back to stores"
        secondaryTo="/deals"
        secondaryLabel="Browse deals"
      />
    );
  }

  if (error || !store) {
    return (
      <main className="page-shell">
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h2>Could not load this store</h2>
            <p>{error?.message || 'The store may no longer be available.'}</p>
            <div className="state-card__actions">
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
              <Link to="/stores" className="button button--ghost">
                Back to stores
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Link to="/stores" className="page-backlink">
        <ArrowLeft size={16} />
        Back to stores
      </Link>

      <section className="store-public-detail">
        <article className="store-public-detail__card">
          <div className="store-public-detail__topline">
            <span className="listing-card__badge">Verified store</span>
            {store.isVerified ? (
              <span className="store-public-detail__verified">
                <BadgeCheck size={16} />
                Verified retailer
              </span>
            ) : null}
          </div>

          <div className="store-public-detail__header">
            <h1>{store.name}</h1>
            <p>{store.address}</p>
          </div>

          <div className="store-public-detail__meta">
            <span>
              <MapPin size={16} />
              {store.cityLabel}, {store.stateLabel}
            </span>
            <span>
              <Phone size={16} />
              {store.phoneLabel}
            </span>
            <span>
              <Star size={16} />
              {store.rating ? `${store.rating} / 5` : 'No ratings yet'}
            </span>
          </div>

          <div className="store-public-detail__actions">
            {store.phone ? (
              <a href={`tel:${store.phone}`} className="button button--primary">
                <Phone size={16} />
                Call store
              </a>
            ) : null}
            <Link to={`/deals?city=${encodeURIComponent(store.cityValue || store.cityLabel)}`} className="button button--secondary">
              Browse local deals
            </Link>
          </div>
        </article>

        <StoreRatingPanel store={store} currentUser={currentUser} />
      </section>

      <StorePublicDealsSection
        storeId={store.id}
        storeName={store.name}
        cityLabel={store.cityValue || store.cityLabel}
      />
    </main>
  );
}
