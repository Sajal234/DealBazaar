import { AlertCircle, ArrowLeft, Clock3, LoaderCircle, MapPin, Phone, Search, Star } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ResourceNotFoundState } from '../components/ResourceNotFoundState';
import { trackDealClick } from '../features/deals/deals.api';
import { isValidDealId } from '../features/deals/deals.keys';
import { useDealDetailQuery } from '../features/deals/deals.queries';
import { StoreRatingPanel } from '../features/store/StoreRatingPanel';
import { useStoreDetailQuery } from '../features/store/store.queries';

function ContactAction({ deal }) {
  if (deal.status !== 'active') {
    return <span className="button button--secondary button--disabled">Contact is available after approval</span>;
  }

  const phone = deal.store?.phone ? String(deal.store.phone).trim() : '';

  if (!phone) {
    return <span className="button button--secondary button--disabled">Store contact unavailable</span>;
  }

  return (
    <a
      href={`tel:${phone}`}
      className="button button--primary"
      onClick={() => {
        trackDealClick(deal.id);
      }}
    >
      <Phone size={18} />
      Call store
    </a>
  );
}

const dealStatusCopy = {
  active: {
    badge: 'Verified deal',
    metaLabel: 'Live now',
    banner: '',
  },
  pending: {
    badge: 'Pending deal',
    metaLabel: 'Awaiting review',
    banner: 'You are viewing a private seller preview. This deal is still pending admin review.',
  },
  rejected: {
    badge: 'Rejected deal',
    metaLabel: 'Needs changes',
    banner: 'This deal is not visible to shoppers. Update it in your seller workspace and resubmit when ready.',
  },
  expired: {
    badge: 'Expired deal',
    metaLabel: 'Expired',
    banner: 'This deal has expired and is no longer visible to shoppers. You can resubmit it from your seller workspace.',
  },
};

export function DealDetailPage({ currentUser }) {
  const { dealId } = useParams();
  const location = useLocation();
  const initialDealEntry = location.state?.dealPreviewEntry || null;
  const hasValidDealId = isValidDealId(dealId);
  const {
    data: deal,
    isLoading,
    isPlaceholderData,
    error,
    refetch,
    isRefetching,
  } = useDealDetailQuery(dealId, initialDealEntry);
  const {
    data: storeDetail,
  } = useStoreDetailQuery({
    storeId: deal?.store?.id,
    enabled: Boolean(deal?.store?.id),
  });

  const store = storeDetail || (deal?.store
    ? {
        id: deal.store.id,
        name: deal.store.name || 'Verified local store',
        cityLabel: deal.store.city || deal.cityLabel,
        phone: deal.store.phone || '',
        phoneLabel: deal.store.phone || 'Not available',
        rating: deal.store.rating || null,
        totalRatings: 0,
        myRating: null,
        isVerified: Boolean(deal.store.isVerified),
        address: '',
      }
    : null);
  const statusCopy = dealStatusCopy[deal.status] || dealStatusCopy.pending;

  if (!hasValidDealId) {
    return (
      <ResourceNotFoundState
        title="Invalid deal link"
        message="The deal address is malformed or no longer available."
        backTo="/deals"
        backLabel="Back to deals"
      />
    );
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Loading deal details</h2>
            <p>Fetching the latest verified deal information.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error?.status === 404) {
    return (
      <ResourceNotFoundState
        title="This deal is no longer available"
        message="It may have expired, been removed, or never existed at this address."
        backTo="/deals"
        backLabel="Back to deals"
        secondaryTo="/stores"
        secondaryLabel="Browse stores"
      />
    );
  }

  if (error || !deal) {
    return (
      <main className="page-shell">
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h2>Could not load this deal</h2>
            <p>{error?.message || 'The deal may have expired or is no longer available.'}</p>
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
              <Link to="/deals" className="button button--ghost">
                Back to deals
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Link to="/deals" className="page-backlink">
        <ArrowLeft size={16} />
        Back to deals
      </Link>

      <section className="deal-detail">
        <div className="deal-detail__media">
          {deal.imageUrl ? (
            <img src={deal.imageUrl} alt={deal.title} className="deal-detail__image" />
          ) : (
            <div className="deal-detail__image deal-detail__image--placeholder" aria-hidden="true">
              <Search size={20} />
            </div>
          )}
        </div>

        <div className="deal-detail__content">
          <div className="deal-detail__topline">
            <span className={`listing-card__badge listing-card__badge--${deal.status === 'active' ? 'active' : 'muted'}`}>
              {statusCopy.badge}
            </span>
            <span className="deal-detail__price">{deal.priceLabel}</span>
          </div>

          {isPlaceholderData ? (
            <p className="deal-detail__status">Refreshing live details...</p>
          ) : null}

          {statusCopy.banner ? <p className="deal-detail__status deal-detail__status--notice">{statusCopy.banner}</p> : null}

          <div className="deal-detail__header">
            <h1>{deal.title}</h1>
            <p>{deal.description}</p>
          </div>

          <div className="deal-detail__meta">
            <span>
              <MapPin size={16} />
              {deal.cityLabel}
            </span>
            <span>
              <Clock3 size={16} />
              {statusCopy.metaLabel}
            </span>
            {store?.rating ? (
              <span>
                <Star size={16} />
                {store.rating} rating
              </span>
            ) : null}
          </div>

          <div className="detail-store-card">
            <p className="detail-store-card__eyebrow">Store</p>
            <h2>{store?.name || 'Verified local store'}</h2>
            <p>
              {store?.cityLabel || deal.cityLabel}
              {store?.isVerified ? ' • Verified retailer' : ''}
            </p>
            {store?.address ? <p className="detail-store-card__address">{store.address}</p> : null}
            {store?.id ? (
              <Link to={`/stores/${store.id}`} className="detail-store-card__link">
                View store page
              </Link>
            ) : null}
          </div>

          {store?.id ? <StoreRatingPanel store={store} currentUser={currentUser} /> : null}

          <div className="deal-detail__actions">
            <ContactAction deal={deal} />
            <Link to="/deals" className="button button--secondary">
              Keep browsing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
