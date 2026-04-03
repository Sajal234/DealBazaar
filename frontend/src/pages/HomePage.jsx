import { useState } from 'react';
import { ArrowRight, Search, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    key: 'explore',
    icon: Search,
    eyebrow: 'Explore',
    title: 'Find serious offers fast',
    description: 'Search live deals, compare store quality, and reach out with context.',
  },
  {
    key: 'sell',
    icon: Store,
    eyebrow: 'Sell',
    title: 'Give stores a cleaner digital surface',
    description: 'Structured onboarding and deal workflows help local inventory reach demand.',
  },
  {
    key: 'trust',
    icon: ShieldCheck,
    eyebrow: 'Trust',
    title: 'Keep trust visible',
    description: 'Ratings, approvals, and expiry rules keep listings current instead of noisy.',
  },
];

export function HomePage() {
  const [activeFeature, setActiveFeature] = useState('explore');

  return (
    <div className="page page--home">
      <div className="hero-layout">
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
            <Link to="/deals" className="button button--primary">
              Explore verified deals
              <ArrowRight size={18} />
            </Link>
            <Link to="/store" className="button button--secondary">
              Start selling locally
            </Link>
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

        <section className="hero-panel" aria-label="Product pillars">
          {featureCards.map((card) => {
            const Icon = card.icon;
            const isActive = activeFeature === card.key;

            return (
              <button
                key={card.key}
                type="button"
                className={`feature-card${card.key === 'explore' ? ' feature-card--primary' : ''}${
                  isActive ? ' is-active' : ''
                }`}
                onMouseEnter={() => setActiveFeature(card.key)}
                onFocus={() => setActiveFeature(card.key)}
                onClick={() => setActiveFeature(card.key)}
              >
                <div className="feature-card__icon">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="feature-card__eyebrow">{card.eyebrow}</p>
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}
