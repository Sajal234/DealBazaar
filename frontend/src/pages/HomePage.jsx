import { ArrowRight, Clock3, MapPin, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <main className="home-storefront">
      <section className="home-hero">
        <div className="home-hero__copy">
          <div className="hero__badge">
            <Sparkles size={14} />
            <span>Verified local deals</span>
          </div>

          <h1>Shop nearby offers without the marketplace mess.</h1>
          <p>
            Browse approved offers from real stores, compare quickly, and contact the seller only
            when the deal is actually worth your time.
          </p>

          <div className="home-hero__actions">
            <Link to="/deals" className="button button--primary">
              Explore deals
              <ArrowRight size={18} />
            </Link>
            <Link to="/store" className="button button--secondary">
              Sell on DealBazaar
            </Link>
          </div>

          <ul className="home-hero__trust" aria-label="Marketplace trust signals">
            <li>Admin-approved deals</li>
            <li>Verified local stores</li>
            <li>Auto-expiring offers</li>
          </ul>
        </div>
      </section>

      <section className="home-highlights" aria-label="Marketplace highlights">
        <div className="home-highlights__item">
          <strong>48–72h</strong>
          <span>Moderated deal lifecycle</span>
        </div>
        <div className="home-highlights__item">
          <strong>1 flow</strong>
          <span>From discovery to store contact</span>
        </div>
        <div className="home-highlights__item">
          <strong>0 noise</strong>
          <span>Cleaner than crowded classifieds</span>
        </div>
        <div className="home-highlights__item">
          <strong>Trusted</strong>
          <span>Verification-first marketplace design</span>
        </div>
      </section>

      <section className="home-deals" aria-label="Marketplace preview">
        <div className="home-featured__header">
          <div>
            <p className="preview-shell__eyebrow">Marketplace preview</p>
            <h2>Popular deals right now</h2>
          </div>
          <Link to="/deals" className="home-featured__link">
            Browse all deals
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="home-featured__grid">
          <article className="listing-card">
            <div>
              <p className="preview-shell__eyebrow">Featured</p>
              <h3>Weekend flagship price drop</h3>
            </div>
            <div className="listing-card__topline">
              <span className="listing-card__badge">Verified store</span>
              <span className="listing-card__price">From ₹18,999</span>
            </div>
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
                Ends tonight
              </span>
              <span className="listing-card__action" aria-hidden="true">
                View deal
              </span>
            </div>
          </article>

          <article className="listing-card listing-card--muted">
            <div>
              <p className="preview-shell__eyebrow">Latest</p>
              <h3>Accessory bundle with pickup today</h3>
            </div>
            <div className="listing-card__topline">
              <span className="listing-card__badge">Moderated today</span>
              <span className="listing-card__price">From ₹2,499</span>
            </div>
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
              <span
                className="listing-card__action listing-card__action--quiet"
                aria-hidden="true"
              >
                Compare
              </span>
            </div>
          </article>

          <article className="listing-card">
            <div>
              <p className="preview-shell__eyebrow">Popular</p>
              <h3>Same-day pickup on store clearance stock</h3>
            </div>
            <div className="listing-card__topline">
              <span className="listing-card__badge">Trusted seller</span>
              <span className="listing-card__price">From ₹7,999</span>
            </div>
            <p className="listing-card__store">Pixel Point</p>
            <div className="listing-card__meta">
              <span>
                <MapPin size={14} />
                HSR Layout
              </span>
              <span>
                <Star size={14} />
                4.7 rating
              </span>
            </div>
            <div className="listing-card__footer">
              <span>
                <Clock3 size={14} />
                Ends in 8h
              </span>
              <span className="listing-card__action" aria-hidden="true">
                View deal
              </span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
