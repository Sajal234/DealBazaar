import { ArrowRight, Handshake, Shield, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StitchBottomNav, StitchDesktopHeader, StitchMobileHeader } from '../components/StitchChrome';
import { useDealsQuery } from '../features/deals/deals.queries';
import { useStoresQuery } from '../features/store/store.queries';

const desktopTrustItems = [
  {
    title: 'Verified Identity',
    description:
      'Store owners must provide official documentation before their store becomes visible.',
  },
  {
    title: 'Moderated Listings',
    description:
      'Every live listing passes through review so browsing stays clean, current, and credible.',
  },
  {
    title: 'Direct Local Contact',
    description:
      'Shoppers contact stores directly once a deal is worth their time, without extra clutter.',
  },
];

const footerColumns = [
  {
    heading: 'Platform',
    items: ['Browse Deals', 'Verified Stores', 'Seller Workspace'],
  },
  {
    heading: 'Company',
    items: ['Trust & Safety', 'Moderation', 'Contact'],
  },
];

function MarketingMedia({ src = '', alt = '', title, subtitle = '' }) {
  if (src) {
    return <img src={src} alt={alt || title} loading="lazy" />;
  }

  return (
    <div className="marketing-media-placeholder" role="img" aria-label={alt || title}>
      <span>{subtitle || 'No photo uploaded'}</span>
      <strong>{title}</strong>
    </div>
  );
}

function HeroPanel({ featuredDeals, storeTotal, dealsTotal }) {
  const topDeals = featuredDeals.slice(0, 3);

  return (
    <div className="marketing-hero__panel">
      <div className="marketing-hero__panel-header">
        <span className="marketing-badge marketing-badge--soft">Live on DealGrab</span>
        <h2>Verified local commerce, shaped for fast browsing.</h2>
        <p>{dealsTotal} live deals across {storeTotal} approved stores.</p>
      </div>

      <div className="marketing-hero__stats">
        <article className="marketing-hero__stat">
          <strong>{storeTotal}</strong>
          <span>Approved stores</span>
        </article>
        <article className="marketing-hero__stat">
          <strong>{dealsTotal}</strong>
          <span>Live deals</span>
        </article>
        <article className="marketing-hero__stat">
          <strong>24/7</strong>
          <span>Moderation flow</span>
        </article>
      </div>

      <div className="marketing-hero__list">
        {topDeals.length > 0 ? (
          topDeals.map((deal) => (
            <Link key={deal.id} to={`/deals/${deal.id}`} className="marketing-hero__list-item">
              <div className="marketing-hero__list-icon">
                <Store size={15} />
              </div>
              <div>
                <h3>{deal.title}</h3>
                <p>{deal.store?.name || deal.cityLabel}</p>
              </div>
              <strong>{deal.priceLabel}</strong>
            </Link>
          ))
        ) : (
          <div className="marketing-empty-card marketing-empty-card--compact">
            <h3>No live deals yet</h3>
            <p>Approved offers will appear here as soon as stores publish them.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopFeaturedSection({ featuredDeals, storeTotal, dealsTotal }) {
  const primaryDeal = featuredDeals[0] || null;
  const secondaryDeals = featuredDeals.slice(1, 3);

  return (
    <section className="marketing-section marketing-section--featured">
      <div className="marketing-section__header">
        <div>
          <h2>Editor&apos;s Picks</h2>
          <p>{dealsTotal} live deals across {storeTotal} approved stores.</p>
        </div>
        <Link to="/deals" className="marketing-section__link">
          View Collection
          <ArrowRight size={14} />
        </Link>
      </div>

      {primaryDeal ? (
        <div className="marketing-featured-grid">
          <Link to={`/deals/${primaryDeal.id}`} className="marketing-featured-card marketing-featured-card--primary">
            <MarketingMedia
              src={primaryDeal.imageUrl}
              alt={primaryDeal.title}
              title={primaryDeal.title}
              subtitle="No product photo uploaded"
            />
            <div className="marketing-featured-card__overlay" />
            <div className="marketing-featured-card__content">
              <span className="marketing-badge">
                {primaryDeal.store?.isVerified ? 'Verified Seller' : 'Live Deal'}
              </span>
              <h3>{primaryDeal.title}</h3>
              <p>{primaryDeal.priceLabel} · {primaryDeal.cityLabel}</p>
            </div>
          </Link>

          <div className="marketing-featured-stack">
            {secondaryDeals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`} className="marketing-featured-card marketing-featured-card--secondary">
                <MarketingMedia
                  src={deal.imageUrl}
                  alt={deal.title}
                  title={deal.title}
                  subtitle="No product photo uploaded"
                />
                <div className="marketing-featured-card__panel">
                  <h3>{deal.title}</h3>
                  <p>{deal.store?.name || deal.cityLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="marketing-empty-card">
          <h3>No live deals yet</h3>
          <p>Approved offers will show up here as soon as verified stores publish them.</p>
        </div>
      )}
    </section>
  );
}

function DesktopHome({ currentUser, featuredDeals, storeTotal, dealsTotal }) {
  return (
    <div className="marketing-home marketing-home--desktop">
      <StitchDesktopHeader active="home" currentUser={currentUser} />

      <main className="marketing-home__main">
        <section className="marketing-hero">
          <div className="marketing-hero__copy">
            <h1>Verified local deals, without marketplace clutter.</h1>
            <p>
              DealGrab helps shoppers discover approved local offers from real stores, while store
              owners manage listings through a moderated, trust-first workflow.
            </p>

            <div className="marketing-hero__actions">
              <Link to="/deals" className="marketing-button marketing-button--primary">
                Browse Deals
              </Link>
              <Link to="/store" className="marketing-button marketing-button--secondary">
                Manage Store
              </Link>
            </div>
          </div>

          <HeroPanel featuredDeals={featuredDeals} storeTotal={storeTotal} dealsTotal={dealsTotal} />
        </section>

        <DesktopFeaturedSection featuredDeals={featuredDeals} storeTotal={storeTotal} dealsTotal={dealsTotal} />

        <section className="marketing-trust">
          <div className="marketing-trust__intro">
            <Shield size={18} />
            <h2>Built on trust, not noise.</h2>
            <p>
              Every merchant on DealGrab goes through review before going live. Verification,
              moderation, and expiry cues stay visible so the experience feels clear on both
              desktop and mobile.
            </p>
          </div>

          <div className="marketing-trust__grid">
            {desktopTrustItems.map((item) => (
              <article key={item.title} className="marketing-trust-card">
                <div className="marketing-trust-card__icon">
                  <Shield size={16} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-footer__inner">
          <div className="marketing-footer__brand">
            <h2>DealGrab</h2>
            <p>
              A premium local marketplace for real stores, approved deals, and fast trust-first
              discovery.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading} className="marketing-footer__column">
              <h3>{column.heading}</h3>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="marketing-footer__bottom">
          <span>© 2026 DealGrab. All rights reserved.</span>
          <div>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileHome({ currentUser, featuredDeals, storeTotal, dealsTotal }) {
  const primaryDeal = featuredDeals[0] || null;
  const secondaryDeals = featuredDeals.slice(1, 3);

  return (
    <div className="marketing-home marketing-home--mobile">
      <StitchMobileHeader currentUser={currentUser} />

      <main className="marketing-mobile-main">
        <section className="marketing-mobile-hero">
          <span className="marketing-mobile-pill">DealGrab live</span>
          <h2>Trusted local deals. Fast to scan.</h2>
          <p>
            Browse {dealsTotal} live offers from {storeTotal} approved stores.
          </p>

          <div className="marketing-mobile-stats">
            <article className="marketing-mobile-stat">
              <strong>{storeTotal}</strong>
              <span>Stores</span>
            </article>
            <article className="marketing-mobile-stat">
              <strong>{dealsTotal}</strong>
              <span>Deals</span>
            </article>
          </div>

          <Link to="/deals" className="marketing-button marketing-button--primary marketing-button--full">
            Explore Deals
          </Link>
        </section>

        <section className="marketing-mobile-section">
          <div className="marketing-mobile-section__header">
            <h3>Featured Today</h3>
            <Link to="/deals" className="marketing-mobile-link">
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          {primaryDeal ? (
            <div className="marketing-mobile-cards">
              <Link to={`/deals/${primaryDeal.id}`} className="marketing-mobile-featured">
                <div className="marketing-mobile-featured__image-wrap">
                  <MarketingMedia
                    src={primaryDeal.imageUrl}
                    alt={primaryDeal.title}
                    title={primaryDeal.title}
                    subtitle="No product photo uploaded"
                  />
                  <span className="marketing-mobile-featured__badge">
                    {primaryDeal.store?.isVerified ? 'Verified' : 'Live'}
                  </span>
                </div>
                <div className="marketing-mobile-featured__body">
                  <div className="marketing-mobile-featured__headline">
                    <h4>{primaryDeal.title}</h4>
                    <span>{primaryDeal.priceLabel}</span>
                  </div>
                  <p>{primaryDeal.description}</p>
                  <small>{primaryDeal.store?.name || primaryDeal.cityLabel}</small>
                </div>
              </Link>

              {secondaryDeals.map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.id}`} className="marketing-mobile-list-card">
                  <div className="marketing-mobile-list-card__thumb">
                    <MarketingMedia
                      src={deal.imageUrl}
                      alt={deal.title}
                      title={deal.title}
                      subtitle="No photo"
                    />
                  </div>
                  <div className="marketing-mobile-list-card__body">
                    <h4>{deal.title}</h4>
                    <span>{deal.priceLabel}</span>
                    <small>{deal.cityLabel}</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="marketing-empty-card marketing-empty-card--mobile">
              <h3>No live deals yet</h3>
              <p>Approved offers will show up here as soon as stores publish them.</p>
            </div>
          )}
        </section>

        <section className="marketing-mobile-trust">
          <h3>Why DealGrab?</h3>

          <article className="marketing-mobile-trust__item">
            <div className="marketing-mobile-trust__icon">
              <Shield size={16} />
            </div>
            <div>
              <h4>Verified merchants</h4>
              <p>
                Every seller passes review before their store can appear publicly.
              </p>
            </div>
          </article>

          <article className="marketing-mobile-trust__item">
            <div className="marketing-mobile-trust__icon">
              <Handshake size={16} />
            </div>
            <div>
              <h4>Direct store contact</h4>
              <p>
                Browse locally, call the store, and confirm pickup without the usual clutter.
              </p>
            </div>
          </article>
        </section>
      </main>

      <StitchBottomNav active="home" currentUser={currentUser} />
    </div>
  );
}

export function HomePage({ currentUser = null }) {
  const dealsQuery = useDealsQuery({ limit: 3, page: 1 });
  const storesQuery = useStoresQuery({ limit: 1, page: 1 });
  const featuredDeals = dealsQuery.data?.items || [];
  const dealsTotal = dealsQuery.data?.pagination?.total || featuredDeals.length;
  const storeTotal = storesQuery.data?.pagination?.total || 0;

  return (
    <>
      <DesktopHome currentUser={currentUser} featuredDeals={featuredDeals} storeTotal={storeTotal} dealsTotal={dealsTotal} />
      <MobileHome currentUser={currentUser} featuredDeals={featuredDeals} storeTotal={storeTotal} dealsTotal={dealsTotal} />
    </>
  );
}
