import { Moon, SunMedium } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authKeys } from '../features/auth/auth.queries';
import { clearAuthSession } from '../features/auth/auth.session';
import { storeKeys } from '../features/store/store.queries';

export function AppLayout({ children, theme, setTheme, currentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  const handleSignOut = () => {
    clearAuthSession();
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: storeKeys.all });
    navigate('/', { replace: true });
  };

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
            {currentUser ? (
              <NavLink
                to="/store"
                className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
              >
                Store
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="topbar__actions">
          <NavLink to="/deals" className="button button--ghost">
            Browse deals
          </NavLink>

          {currentUser ? (
            <>
              <span className="topbar__account">
                {currentUser.name || currentUser.email}
              </span>
              <button type="button" className="button button--secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="button button--secondary">
              Sign in
            </NavLink>
          )}

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
