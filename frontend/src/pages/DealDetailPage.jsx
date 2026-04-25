import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { MaterialIcon, StitchBottomNav, StitchDesktopHeader, StitchMobileHeader } from '../components/StitchChrome';
import { StitchAvatar, StitchMediaFrame } from '../components/StitchDataVisuals';
import { trackDealClick } from '../features/deals/deals.api';
import { isValidDealId } from '../features/deals/deals.keys';
import { useDealDetailQuery } from '../features/deals/deals.queries';
import { useStoreDetailQuery } from '../features/store/store.queries';

function formatRelativeExpiry(value) {
  if (!value) {
    return 'Availability confirmed';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return 'Availability confirmed';
  }

  const diffMs = parsed.getTime() - Date.now();

  if (diffMs <= 0) {
    return 'Expired';
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatRelativeDate(value, fallback = 'Recently updated') {
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
    return 'Updated just now';
  }

  if (diffHours < 24) {
    return `Updated ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `Updated ${diffDays}d ago`;
}

function getStatusLabel(status) {
  if (status === 'active') {
    return 'Live Deal';
  }

  if (status === 'rejected') {
    return 'Needs Review';
  }

  if (status === 'expired') {
    return 'Expired';
  }

  return 'Pending Review';
}

function getDetailStateTitle(error) {
  if (error?.status === 404) {
    return 'This deal is no longer available';
  }

  return 'Could not load this deal';
}

function getDetailStateBody(error) {
  if (error?.status === 404) {
    return 'It may have expired, been removed, or never existed at this address.';
  }

  return error?.message || 'The deal may have expired or is no longer available.';
}

function DetailState({ currentUser, title, description, actionLabel = '', onAction = null }) {
  return (
    <div className="stitch-page">
      <StitchDesktopHeader active="browse" currentUser={currentUser} />
      <main className="stitch-canvas stitch-canvas--detail">
        <section className="stitch-state-card" aria-live="polite">
          <div className="stitch-state-card__icon">
            <MaterialIcon name="warning" />
          </div>
          <div className="stitch-state-card__copy">
            <h2>{title}</h2>
            <p>{description}</p>
            <div className="stitch-inline-actions">
              <Link to="/deals" className="stitch-pill-button stitch-pill-button--primary">
                Back to Deals
              </Link>
              {actionLabel && onAction ? (
                <button type="button" className="stitch-pill-button" onClick={onAction}>
                  {actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <StitchBottomNav active="explore" currentUser={currentUser} />
    </div>
  );
}

function DealGallery({ deal, selectedImage, setSelectedImage, galleryImages }) {
  return (
    <div className="stitch-detail-gallery">
      <div className="stitch-detail-gallery__primary">
        <StitchMediaFrame
          src={selectedImage}
          alt={deal.title}
          title={deal.title}
          subtitle="No product photo uploaded"
          icon="sell"
        />
      </div>

      {galleryImages.length > 1 ? (
        <div className="stitch-detail-gallery__thumbs">
          {galleryImages.slice(0, 4).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`stitch-detail-gallery__thumb${selectedImage === image ? ' stitch-detail-gallery__thumb--active' : ''}`}
              onClick={() => {
                setSelectedImage(image);
              }}
            >
              <img src={image} alt={`${deal.title} view ${index + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StoreSummary({ deal, store }) {
  return (
    <section className="stitch-store-highlight">
      <div className="stitch-store-highlight__profile">
        <StitchAvatar label={store?.name || 'Local store'} size="md" className="stitch-store-highlight__avatar" />

        <div>
          <div className="stitch-store-highlight__heading">
            <h3>{store?.name || 'Local store'}</h3>
            {store?.isVerified ? <MaterialIcon name="verified" filled className="stitch-store-highlight__verified" /> : null}
          </div>

          <div className="stitch-store-highlight__meta">
            {store?.rating ? <span>{store.rating} / 5</span> : <span>No ratings yet</span>}
            {store?.totalRatings ? <span>{store.totalRatings} review{store.totalRatings === 1 ? '' : 's'}</span> : null}
            <span>{formatRelativeDate(store?.createdAt, 'Trusted merchant')}</span>
          </div>
        </div>
      </div>

      <div className="stitch-store-highlight__summary">
        <p>
          {store?.address
            ? `${store.address}, ${store.cityLabel || deal.cityLabel}`
            : `Verified local inventory available in ${store?.cityLabel || deal.cityLabel}.`}
        </p>

        {store?.id ? (
          <Link to={`/stores/${store.id}`} className="stitch-section__link">
            View Store Profile
            <MaterialIcon name="arrow_forward" className="stitch-section__link-icon" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function DesktopDetailView({ currentUser, deal, store, selectedImage, setSelectedImage, galleryImages }) {
  const callHref = store?.phone ? `tel:${store.phone}` : '';

  return (
    <div className="stitch-page stitch-page--desktop">
      <StitchDesktopHeader active="browse" currentUser={currentUser} />

      <main className="stitch-canvas stitch-canvas--detail">
        <nav className="stitch-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/deals">Deals</Link>
          <MaterialIcon name="chevron_right" className="stitch-breadcrumbs__icon" />
          <span>{deal.cityLabel}</span>
          <MaterialIcon name="chevron_right" className="stitch-breadcrumbs__icon" />
          <strong>{deal.title}</strong>
        </nav>

        <section className="stitch-detail-hero">
          <DealGallery
            deal={deal}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            galleryImages={galleryImages}
          />

          <div className="stitch-detail-panel">
            <div className="stitch-detail-panel__topline">
              <span className="stitch-status-pill">
                <MaterialIcon name="sell" className="stitch-status-pill__icon" />
                {getStatusLabel(deal.status)}
              </span>
            </div>

            <h1>{deal.title}</h1>
            <div className="stitch-detail-panel__price">{deal.priceLabel}</div>

            <div className="stitch-detail-freshness-card">
              <div className="stitch-detail-freshness-card__icon">
                <MaterialIcon name="schedule" />
              </div>
              <div>
                <span>Deal expires in</span>
                <strong>{formatRelativeExpiry(deal.expiresAt)}</strong>
              </div>
            </div>

            <div className="stitch-detail-panel__description">
              {deal.description}
            </div>

            <div className="stitch-detail-panel__actions">
              {callHref ? (
                <a
                  href={callHref}
                  className="stitch-action-button stitch-action-button--primary stitch-action-button--full"
                  onClick={() => {
                    void trackDealClick(deal.id);
                  }}
                >
                  <MaterialIcon name="phone" filled />
                  <span>Call Store</span>
                </a>
              ) : (
                <span className="stitch-action-button stitch-action-button--disabled stitch-action-button--full">
                  Call Unavailable
                </span>
              )}

              {store?.id ? (
                <Link to={`/stores/${store.id}`} className="stitch-action-button stitch-action-button--secondary stitch-action-button--full">
                  View Store
                </Link>
              ) : null}
            </div>

            <div className="stitch-detail-trust-list">
              <div>
                <MaterialIcon name="location_on" />
                <span>
                  Available in <strong>{deal.cityLabel}</strong>
                </span>
              </div>
              <div>
                <MaterialIcon name="verified" />
                <span>{store?.isVerified ? 'Seller is verified on DealGrab' : 'Seller verification pending'}</span>
              </div>
              <div>
                <MaterialIcon name="gavel" />
                <span>{deal.clicks > 0 ? `${deal.clicks} shopper click${deal.clicks === 1 ? '' : 's'} recorded` : 'Contact the store to confirm availability'}</span>
              </div>
            </div>
          </div>
        </section>

        <StoreSummary deal={deal} store={store} />
      </main>
    </div>
  );
}

function MobileDetailView({ currentUser, deal, store, selectedImage, setSelectedImage, galleryImages }) {
  const callHref = store?.phone ? `tel:${store.phone}` : '';

  return (
    <div className="stitch-page stitch-page--mobile">
      <StitchMobileHeader
        currentUser={currentUser}
        backTo="/deals"
        backLabel="Back to deals"
        title="Deal details"
        subtitle={deal.cityLabel}
        trailing={
          store?.id ? (
            <Link to={`/stores/${store.id}`} className="stitch-icon-button stitch-icon-button--surface" aria-label="View store">
              <MaterialIcon name="storefront" />
            </Link>
          ) : (
            <span className="stitch-icon-button stitch-icon-button--surface" aria-hidden="true">
              <MaterialIcon name="sell" />
            </span>
          )
        }
      />

      <div className="stitch-mobile-detail">
        <div className="stitch-mobile-detail__hero stitch-mobile-detail__hero--clean">
          <StitchMediaFrame
            src={selectedImage}
            alt={deal.title}
            title={deal.title}
            subtitle="No product photo uploaded"
            icon="sell"
            shape="portrait"
          />

          {galleryImages.length > 1 ? (
            <div className="stitch-mobile-detail__dots">
              {galleryImages.slice(0, 3).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`stitch-mobile-detail__dot${selectedImage === image ? ' stitch-mobile-detail__dot--active' : ''}`}
                  onClick={() => {
                    setSelectedImage(image);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <main className="stitch-mobile-detail__content">
          <div className="stitch-mobile-detail__labels">
            <span className="stitch-status-pill">{getStatusLabel(deal.status)}</span>
            <span className="stitch-mobile-detail__expiry">
              <MaterialIcon name="schedule" className="stitch-mobile-detail__expiry-icon" />
              Ends in {formatRelativeExpiry(deal.expiresAt)}
            </span>
          </div>

          <h1>{deal.title}</h1>
          <div className="stitch-mobile-detail__price">{deal.priceLabel}</div>

          <div className="stitch-mobile-store-card">
            <div className="stitch-mobile-store-card__header">
              <StitchAvatar label={store?.name || 'Local store'} size="sm" className="stitch-mobile-store-card__avatar" />

              <div>
                <h3>{store?.name || 'Local store'}</h3>
                <div className="stitch-mobile-store-card__verification">
                  {store?.isVerified ? <MaterialIcon name="verified" filled className="stitch-mobile-store-card__verified" /> : null}
                  <span>{store?.isVerified ? 'Verified merchant' : 'Verification pending'}</span>
                </div>
              </div>
            </div>

            <div className="stitch-mobile-store-card__divider" />

            <div className="stitch-mobile-store-card__facts">
              <div>
                <MaterialIcon name="location_on" />
                <span>{store?.address ? `${store.address}, ${store.cityLabel || deal.cityLabel}` : `${deal.cityLabel} local area`}</span>
              </div>
              <div>
                <MaterialIcon name="store" />
                <span>{deal.clicks > 0 ? `${deal.clicks} shopper click${deal.clicks === 1 ? '' : 's'} recorded` : 'Moderated marketplace listing'}</span>
              </div>
            </div>
          </div>

          <section className="stitch-mobile-detail__section">
            <h2>About this deal</h2>
            <div className="stitch-mobile-detail__body">
              <p>{deal.description}</p>
            </div>
          </section>

          <section className="stitch-mobile-terms">
            <h3>Details</h3>
            <ul>
              <li>
                <MaterialIcon name="check" filled />
                <span>Approved listing from a local seller.</span>
              </li>
              <li>
                <MaterialIcon name="check" filled />
                <span>Call the store to confirm pickup timing and stock.</span>
              </li>
              <li>
                <MaterialIcon name="check" filled />
                <span>{deal.expiresAt ? `Offer currently tracked for ${formatRelativeExpiry(deal.expiresAt)}.` : 'Availability may change without notice.'}</span>
              </li>
            </ul>
          </section>
        </main>

        <div className="stitch-mobile-detail__cta">
          {callHref ? (
            <a
              href={callHref}
              className="stitch-action-button stitch-action-button--primary stitch-action-button--full"
              onClick={() => {
                void trackDealClick(deal.id);
              }}
            >
              <MaterialIcon name="call" />
              <span>Call Store</span>
            </a>
          ) : (
            <span className="stitch-action-button stitch-action-button--disabled stitch-action-button--full">
              Call Unavailable
            </span>
          )}

          {store?.id ? (
            <Link to={`/stores/${store.id}`} className="stitch-action-button stitch-action-button--secondary stitch-action-button--icon-only" aria-label="View store">
              <MaterialIcon name="storefront" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function DealDetailPage({ currentUser = null }) {
  const { dealId } = useParams();
  const location = useLocation();
  const initialDealEntry = location.state?.dealPreviewEntry || null;
  const hasValidDealId = isValidDealId(dealId);
  const {
    data: deal,
    isLoading,
    error,
    refetch,
  } = useDealDetailQuery(dealId, initialDealEntry);
  const { data: storeDetail } = useStoreDetailQuery({
    storeId: deal?.store?.id,
    enabled: Boolean(deal?.store?.id),
  });

  const store = storeDetail || deal?.store || null;
  const galleryImages = useMemo(() => {
    if (Array.isArray(deal?.images) && deal.images.length > 0) {
      return deal.images;
    }

    if (deal?.imageUrl) {
      return [deal.imageUrl];
    }

    return [];
  }, [deal?.imageUrl, deal?.images]);
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || '');

  useEffect(() => {
    setSelectedImage(galleryImages[0] || '');
  }, [galleryImages]);

  if (!hasValidDealId) {
    return (
      <DetailState
        currentUser={currentUser}
        title="Invalid deal link"
        description="The deal address is malformed or no longer available."
      />
    );
  }

  if (isLoading) {
    return (
      <DetailState
        currentUser={currentUser}
        title="Loading deal details"
        description="Fetching the latest verified deal information."
      />
    );
  }

  if (error || !deal) {
    return (
      <DetailState
        currentUser={currentUser}
        title={getDetailStateTitle(error)}
        description={getDetailStateBody(error)}
        actionLabel={error?.status === 404 ? '' : 'Try Again'}
        onAction={error?.status === 404 ? null : refetch}
      />
    );
  }

  return (
    <>
      <DesktopDetailView
        currentUser={currentUser}
        deal={deal}
        store={store}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        galleryImages={galleryImages}
      />
      <MobileDetailView
        currentUser={currentUser}
        deal={deal}
        store={store}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        galleryImages={galleryImages}
      />
    </>
  );
}
