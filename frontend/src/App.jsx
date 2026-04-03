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
          <div className="brand__mark">DB</div>
          <div>
            <p className="brand__name">DealBazaar</p>
            <p className="brand__subtext">Premium local commerce, designed for trust.</p>
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

          <h1>Calm, premium discovery for the stores around you.</h1>
          <p>
            DealBazaar brings verified offline retailers into a cleaner digital storefront, so
            shoppers can find trusted live offers and stores can publish with credibility.
          </p>

          <div className="hero__actions">
            <button type="button" className="button button--primary">
              Explore deals
              <ArrowRight size={18} />
            </button>
            <button type="button" className="button button--secondary">
              List your store
            </button>
          </div>

          <dl className="hero-metrics">
            <div>
              <dt>48–72h</dt>
              <dd>moderated deal lifecycle</dd>
            </div>
            <div>
              <dt>1 flow</dt>
              <dd>for discovery, trust, and outreach</dd>
            </div>
            <div>
              <dt>0 noise</dt>
              <dd>from cluttered classified marketplaces</dd>
            </div>
          </dl>
        </section>

        <section className="hero-panel">
          <article className="feature-card feature-card--primary">
            <div className="feature-card__icon">
              <Search size={18} />
            </div>
            <div>
              <p className="feature-card__eyebrow">Explore</p>
              <h2>Find active offers with clarity</h2>
              <p>
                Search current deals, compare store quality, and move directly into calling or
                messaging with confidence.
              </p>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-card__icon">
              <Store size={18} />
            </div>
            <div>
              <p className="feature-card__eyebrow">Sell</p>
              <h2>Give local stores a polished digital layer</h2>
              <p>
                Applications, moderation, and store dashboards create a cleaner path from offline
                inventory to online demand.
              </p>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-card__icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="feature-card__eyebrow">Trust</p>
              <h2>Moderation and expiry keep the marketplace credible</h2>
              <p>
                Ratings, approvals, and automatic expiry handling protect the experience without
                adding friction to honest stores.
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
