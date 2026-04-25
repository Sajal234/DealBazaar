import { Link, useParams } from 'react-router-dom';
import { MaterialIcon, StitchBottomNav, StitchDesktopHeader, StitchMobileHeader } from '../components/StitchChrome';
import { StitchAvatar, StitchMediaFrame } from '../components/StitchDataVisuals';
import { useDealsQuery } from '../features/deals/deals.queries';
import { isValidStoreId } from '../features/store/store.ids';
import { useStoreDetailQuery } from '../features/store/store.queries';

function buildMapHref(store) {
  const parts = [store?.address, store?.cityLabel, store?.stateLabel].filter(Boolean);

  if (parts.length === 0) {
    return '/stores';
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
}

function formatStoreSince(value) {
  if (!value) {
    return 'Recently verified';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Recently verified';
  }

  return `Since ${parsed.getFullYear()}`;
}

function formatStoreRating(store) {
  if (!store?.rating) {
    return 'No ratings yet';
  }

  if (!store.totalRatings) {
    return `${store.rating} / 5`;
  }

  return `${store.rating} / 5 (${store.totalRatings} review${store.totalRatings === 1 ? '' : 's'})`;
}

function ProfileState({ currentUser, title, description }) {
  return (
    <div className="stitch-page">
      <StitchDesktopHeader active="stores" currentUser={currentUser} />
      <main className="stitch-canvas stitch-canvas--store-profile">
        <section className="stitch-state-card" aria-live="polite">
          <div className="stitch-state-card__icon">
            <MaterialIcon name="storefront" />
          </div>
          <div className="stitch-state-card__copy">
            <h2>{title}</h2>
            <p>{description}</p>
            <Link to="/stores" className="stitch-pill-button stitch-pill-button--primary">
              Back to Stores
            </Link>
          </div>
        </section>
      </main>
      <StitchBottomNav active="stores" currentUser={currentUser} />
    </div>
  );
}

function StoreDealCard({ deal }) {
  return (
    <article className="stitch-store-deal-card">
      <Link to={`/deals/${deal.id}`} className="stitch-store-deal-card__media">
        <StitchMediaFrame
          src={deal.imageUrl}
          alt={deal.title}
          title={deal.title}
          subtitle="Live deal"
          icon="sell"
        />
        {deal.store?.isVerified ? <div className="stitch-store-deal-card__pill">Verified</div> : null}
      </Link>

      <div className="stitch-store-deal-card__body">
        <div className="stitch-deal-card__title-row">
          <h3>{deal.title}</h3>
          <span className="stitch-deal-card__price">{deal.priceLabel}</span>
        </div>
        <p>{deal.description}</p>

        <div className="stitch-store-deal-card__footer">
          <div className="stitch-deal-card__meta">
            <div>
              <MaterialIcon name="location_on" className="stitch-deal-card__meta-icon" />
              <span>{deal.cityLabel}</span>
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

export function StorePublicDetailPage({ currentUser = null }) {
  const { storeId } = useParams();
  const hasValidStoreId = isValidStoreId(storeId);
  const { data: store, isLoading, error } = useStoreDetailQuery({
    storeId,
    enabled: hasValidStoreId,
  });
  const { data: dealsData, isLoading: isDealsLoading, error: dealsError } = useDealsQuery({
    limit: 6,
    page: 1,
    storeId: hasValidStoreId ? storeId : '',
  });

  const deals = dealsData?.items || [];
  const mapHref = buildMapHref(store);
  const callHref = store?.phone ? `tel:${store.phone}` : '';
  const locationLabel = store?.address || [store?.cityLabel, store?.stateLabel].filter(Boolean).join(', ');

  if (!hasValidStoreId) {
    return (
      <ProfileState
        currentUser={currentUser}
        title="Invalid store link"
        description="The store address is malformed or no longer available."
      />
    );
  }

  if (isLoading) {
    return (
      <ProfileState
        currentUser={currentUser}
        title="Loading store details"
        description="Fetching the latest public store information."
      />
    );
  }

  if (error || !store) {
    return (
      <ProfileState
        currentUser={currentUser}
        title={error?.status === 404 ? 'This store is no longer available' : 'Could not load this store'}
        description={
          error?.status === 404
            ? 'The store may have been removed or this link may be outdated.'
            : error?.message || 'The store may no longer be available.'
        }
      />
    );
  }

  return (
    <>
      <div className="stitch-page stitch-page--desktop">
        <StitchDesktopHeader active="stores" currentUser={currentUser} />

        <main className="stitch-canvas stitch-canvas--store-profile">
          <section className="stitch-store-profile-grid">
            <div className="stitch-store-hero-card">
              <StitchAvatar label={store.name} size="xl" className="stitch-store-hero-card__avatar" />

              <div className="stitch-store-hero-card__content">
                <div className="stitch-store-hero-card__title">
                  <h1>{store.name}</h1>
                  {store.isVerified ? (
                    <span className="stitch-status-pill">
                      <MaterialIcon name="verified" filled className="stitch-status-pill__icon" />
                      Verified
                    </span>
                  ) : null}
                </div>

                <p>
                  {store.address
                    ? `${store.address}. Approved local seller profile with moderated public deals and direct store contact.`
                    : 'Approved local seller profile with moderated public deals and direct store contact.'}
                </p>

                <div className="stitch-store-hero-card__stats">
                  <div>
                    <MaterialIcon name="star" className="stitch-store-hero-card__stat-icon" />
                    <span>{formatStoreRating(store)}</span>
                  </div>
                  <div>
                    <MaterialIcon name="location_on" className="stitch-store-hero-card__stat-icon" />
                    <span>{locationLabel || 'Local seller'}</span>
                  </div>
                  <div>
                    <MaterialIcon name="storefront" className="stitch-store-hero-card__stat-icon" />
                    <span>{formatStoreSince(store.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <aside className="stitch-store-contact-card">
              <h2>Store Details</h2>

              <address>
                <div>
                  <MaterialIcon name="location_on" />
                  <span>{locationLabel || 'Address not available'}</span>
                </div>
                <div>
                  <MaterialIcon name="call" />
                  <span>{store.phoneLabel}</span>
                </div>
                <div>
                  <MaterialIcon name="verified_user" />
                  <span>{store.isVerified ? 'Approved and visible on DealGrab' : 'Verification pending'}</span>
                </div>
              </address>

              <div className="stitch-store-contact-card__actions">
                {callHref ? (
                  <a href={callHref} className="stitch-action-button stitch-action-button--primary stitch-action-button--full">
                    Contact Store
                  </a>
                ) : (
                  <span className="stitch-action-button stitch-action-button--disabled stitch-action-button--full">
                    Contact Unavailable
                  </span>
                )}

                <a href={mapHref} target="_blank" rel="noreferrer" className="stitch-action-button stitch-action-button--secondary stitch-action-button--full">
                  Open Map
                </a>
              </div>
            </aside>
          </section>

          <section className="stitch-section">
            <div className="stitch-section__header stitch-section__header--bordered">
              <div>
                <h2>Active Deals</h2>
                <p>{deals.length} live offers from this store.</p>
              </div>
            </div>

            {isDealsLoading ? (
              <section className="stitch-state-card">
                <div className="stitch-state-card__icon">
                  <MaterialIcon name="sell" />
                </div>
                <div className="stitch-state-card__copy">
                  <h2>Loading store deals</h2>
                  <p>Fetching the latest active offers from this store.</p>
                </div>
              </section>
            ) : null}

            {!isDealsLoading && dealsError ? (
              <section className="stitch-state-card stitch-state-card--error">
                <div className="stitch-state-card__icon">
                  <MaterialIcon name="warning" />
                </div>
                <div className="stitch-state-card__copy">
                  <h2>Could not load live deals</h2>
                  <p>{dealsError.message || 'Please try again in a moment.'}</p>
                </div>
              </section>
            ) : null}

            {!isDealsLoading && !dealsError && deals.length === 0 ? (
              <section className="stitch-state-card">
                <div className="stitch-state-card__icon">
                  <MaterialIcon name="sell" />
                </div>
                <div className="stitch-state-card__copy">
                  <h2>No live deals yet</h2>
                  <p>This store profile is active, but there are no shopper-facing deals visible at the moment.</p>
                </div>
              </section>
            ) : null}

            {!isDealsLoading && !dealsError && deals.length > 0 ? (
              <div className="stitch-store-deals-grid">
                {deals.map((deal) => (
                  <StoreDealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : null}
          </section>
        </main>

        <StitchBottomNav active="stores" currentUser={currentUser} />
      </div>

      <div className="stitch-page stitch-page--mobile">
        <StitchMobileHeader
          currentUser={currentUser}
          backTo="/stores"
          backLabel="Back to stores"
          title="Store profile"
          subtitle={store.name}
        />

        <main className="stitch-canvas stitch-canvas--mobile-store">
          <section className="stitch-mobile-store-header">
            <StitchAvatar label={store.name} size="lg" className="stitch-mobile-store-header__avatar" />

            <div className="stitch-mobile-store-header__title">
              <h1>{store.name}</h1>
              {store.isVerified ? <MaterialIcon name="verified" filled className="stitch-mobile-store-header__verified" /> : null}
            </div>

            <p>{locationLabel || 'Approved local seller'}</p>

            <div className="stitch-mobile-store-header__actions">
              {callHref ? (
                <a href={callHref} className="stitch-action-button stitch-action-button--primary stitch-action-button--full">
                  Contact
                </a>
              ) : (
                <span className="stitch-action-button stitch-action-button--disabled stitch-action-button--full">
                  Contact
                </span>
              )}

              <a href={mapHref} target="_blank" rel="noreferrer" className="stitch-action-button stitch-action-button--secondary stitch-action-button--full">
                Map
              </a>
            </div>
          </section>

          <section className="stitch-mobile-info-card">
            <div>
              <MaterialIcon name="star" />
              <div>
                <h3>Rating</h3>
                <p>{formatStoreRating(store)}</p>
              </div>
            </div>
            <div>
              <MaterialIcon name="verified_user" />
              <div>
                <h3>Trust</h3>
                <p>{store.isVerified ? 'Verified public seller on DealGrab.' : 'Profile currently under review.'}</p>
              </div>
            </div>
          </section>

          <section className="stitch-section">
            <div className="stitch-section__header">
              <h2>Current Deals</h2>
            </div>

            {isDealsLoading ? (
              <section className="stitch-state-card">
                <div className="stitch-state-card__icon">
                  <MaterialIcon name="sell" />
                </div>
                <div className="stitch-state-card__copy">
                  <h2>Loading store deals</h2>
                  <p>Fetching the latest active offers from this store.</p>
                </div>
              </section>
            ) : null}

            {!isDealsLoading && dealsError ? (
              <section className="stitch-state-card stitch-state-card--error">
                <div className="stitch-state-card__icon">
                  <MaterialIcon name="warning" />
                </div>
                <div className="stitch-state-card__copy">
                  <h2>Could not load live deals</h2>
                  <p>{dealsError.message || 'Please try again in a moment.'}</p>
                </div>
              </section>
            ) : null}

            {!isDealsLoading && !dealsError && deals.length === 0 ? (
              <section className="stitch-state-card">
                <div className="stitch-state-card__icon">
                  <MaterialIcon name="sell" />
                </div>
                <div className="stitch-state-card__copy">
                  <h2>No live deals yet</h2>
                  <p>This store profile is active, but there are no shopper-facing deals visible at the moment.</p>
                </div>
              </section>
            ) : null}

            {!isDealsLoading && !dealsError && deals.length > 0 ? (
              <div className="stitch-mobile-store-deals-stack">
                {deals.map((deal) => (
                  <StoreDealCard key={deal.id} deal={deal} />
                ))}
              </div>
            ) : null}
          </section>
        </main>

        <StitchBottomNav active="stores" currentUser={currentUser} />
      </div>
    </>
  );
}
