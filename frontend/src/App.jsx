import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  SunMedium,
} from 'lucide-react';

const themeStorageKey = 'dealbazaar.theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  let storedTheme = null;

  try {
    storedTheme = window.localStorage.getItem(themeStorageKey);
  } catch {
    storedTheme = null;
  }

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [activeFeature, setActiveFeature] = useState('explore');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(themeStorageKey, theme);
      } catch {}
    }
  }, [theme]);

  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" className="brand__mark-image" />
          </div>
          <div>
            <p className="brand__name">DealBazaar</p>
            <p className="brand__subtext">Verified local commerce.</p>
          </div>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
          aria-label={nextThemeLabel}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
        </button>
      </header>

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

        <section className="hero-panel">
          <button
            type="button"
            className={`feature-card feature-card--primary${activeFeature === 'explore' ? ' is-active' : ''}`}
            onMouseEnter={() => setActiveFeature('explore')}
            onFocus={() => setActiveFeature('explore')}
            onClick={() => setActiveFeature('explore')}
          >
            <div className="feature-card__icon">
              <Search size={18} />
            </div>
            <div>
              <p className="feature-card__eyebrow">Explore</p>
              <h2>Find serious offers fast</h2>
              <p>Search live deals, compare store quality, and reach out with context.</p>
            </div>
          </button>

          <button
            type="button"
            className={`feature-card${activeFeature === 'sell' ? ' is-active' : ''}`}
            onMouseEnter={() => setActiveFeature('sell')}
            onFocus={() => setActiveFeature('sell')}
            onClick={() => setActiveFeature('sell')}
          >
            <div className="feature-card__icon">
              <Store size={18} />
            </div>
            <div>
              <p className="feature-card__eyebrow">Sell</p>
              <h2>Give stores a cleaner digital surface</h2>
              <p>Structured onboarding and deal workflows help local inventory reach demand.</p>
            </div>
          </button>

          <button
            type="button"
            className={`feature-card${activeFeature === 'trust' ? ' is-active' : ''}`}
            onMouseEnter={() => setActiveFeature('trust')}
            onFocus={() => setActiveFeature('trust')}
            onClick={() => setActiveFeature('trust')}
          >
            <div className="feature-card__icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="feature-card__eyebrow">Trust</p>
              <h2>Keep trust visible</h2>
              <p>Ratings, approvals, and expiry rules keep listings current instead of noisy.</p>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}
