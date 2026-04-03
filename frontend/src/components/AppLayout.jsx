import { Moon, SunMedium } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Deals', to: '/deals' },
  { label: 'For Stores', to: '/store' },
  { label: 'Login', to: '/login' },
];

export function AppLayout({ onToggleTheme, theme }) {
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
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="topbar__actions">
          <NavLink to="/deals" className="button button--ghost">
            Browse deals
          </NavLink>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={nextThemeLabel}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
