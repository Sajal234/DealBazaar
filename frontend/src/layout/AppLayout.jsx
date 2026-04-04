import { Moon, SunMedium } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function AppLayout({ children, theme, setTheme }) {
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__cluster">
          <NavLink to="/" className="brand brand--link" aria-label="DealBazaar home">
            <div className="brand__mark" aria-hidden="true">
              <img src="/favicon.svg" alt="" className="brand__mark-image" />
            </div>
            <div>
              <p className="brand__name">DealBazaar</p>
              <p className="brand__subtext">Verified local commerce.</p>
            </div>
          </NavLink>

          <nav className="site-nav" aria-label="Primary navigation">
            <NavLink to="/" end className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
              Home
            </NavLink>
            <NavLink
              to="/deals"
              className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
            >
              Deals
            </NavLink>
          </nav>
        </div>

        <div className="topbar__actions">
          <NavLink to="/deals" className="button button--ghost">
            Browse deals
          </NavLink>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
            aria-label={nextThemeLabel}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="app-content">{children}</div>
    </div>
  );
}
