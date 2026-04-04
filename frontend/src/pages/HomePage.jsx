import { ArrowRight, Clock3, MapPin, Search, Sparkles, Star } from 'lucide-react';

export function HomePage() {
  return (
    <main className="hero-layout">
      <section className="hero-copy">
        <div className="hero__badge">
          <Sparkles size={14} />
          <span>Verified local deals</span>
        </div>

        <h1>Discover local deals with less noise and more trust.</h1>
        <p>
          DealBazaar gives offline stores a disciplined digital layer so shoppers can browse
          current offers quickly and stores can publish with credibility.
        </p>

        <ul className="trust-list" aria-label="Marketplace trust signals">
          <li>Admin-approved deals</li>
          <li>Real store verification</li>
          <li>Auto-expiring offers</li>
        </ul>

        <div className="hero__actions">
          <button type="button" className="button button--primary">
            Explore verified deals
            <ArrowRight size={18} />
          </button>
          <button type="button" className="button button--secondary">
            Start selling locally
          </button>
        </div>

        <dl className="hero-metrics">
          <div>
            <dt>48–72h</dt>
            <dd>moderated lifecycle</dd>
          </div>
          <div>
            <dt>1 flow</dt>
            <dd>from discovery to contact</dd>
          </div>
          <div>
            <dt>0 noise</dt>
            <dd>from cluttered classifieds</dd>
          </div>
        </dl>
      </section>

      <section className="hero-panel" aria-label="Marketplace preview">
        <div className="preview-shell">
          <div className="preview-shell__header">
            <div>
              <p className="preview-shell__eyebrow">Live preview</p>
              <h2>How discovery should feel.</h2>
            </div>
            <div className="preview-shell__search" aria-hidden="true">
              <Search size={16} />
            </div>
          </div>

          <div className="preview-shell__chips" aria-hidden="true">
            <span className="preview-chip preview-chip--active">Verified</span>
            <span className="preview-chip">Active now</span>
            <span className="preview-chip">Nearby</span>
          </div>

          <article className="listing-card">
            <div className="listing-card__topline">
              <span className="listing-card__badge">Verified store</span>
              <span className="listing-card__price">From ₹18,999</span>
            </div>
            <h3>Weekend flagship price drop</h3>
            <p className="listing-card__store">Orbit Digital</p>
            <div className="listing-card__meta">
              <span>
                <MapPin size={14} />
                Koramangala
              </span>
              <span>
                <Star size={14} />
                4.8 rating
              </span>
            </div>
            <div className="listing-card__footer">
              <span>
                <Clock3 size={14} />
                Ends in 11h
              </span>
              <button type="button" className="listing-card__action">
                View deal
              </button>
            </div>
          </article>

          <article className="listing-card listing-card--muted">
            <div className="listing-card__topline">
              <span className="listing-card__badge">Moderated today</span>
              <span className="listing-card__price">From ₹2,499</span>
            </div>
            <h3>Accessory bundle with pickup today</h3>
            <p className="listing-card__store">North Avenue Mobiles</p>
            <div className="listing-card__meta">
              <span>
                <MapPin size={14} />
                Indiranagar
              </span>
              <span>
                <Star size={14} />
                Trusted seller
              </span>
            </div>
            <div className="listing-card__footer">
              <span>
                <Clock3 size={14} />
                Freshly listed
              </span>
              <button type="button" className="listing-card__action listing-card__action--quiet">
                Compare
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
