import { useEffect, useState } from 'react';
import { Menu, Moon, SunMedium, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '../features/admin/admin.queries';
import { authKeys } from '../features/auth/auth.queries';
import { clearAuthSession } from '../features/auth/auth.session';
import { storeKeys } from '../features/store/store.queries';
import { storeDealsKeys } from '../features/store/storeDeals.queries';
import { AppRouteEffects } from './AppRouteEffects';

export function AppLayout({ children, theme, setTheme, currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const handleSignOut = () => {
    setIsMobileNavOpen(false);
    clearAuthSession();
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: storeKeys.all });
    queryClient.removeQueries({ queryKey: storeDealsKeys.all });
    queryClient.removeQueries({ queryKey: adminKeys.all });
    navigate('/', { replace: true });
  };

  return (
    <div className="app-shell">
      <AppRouteEffects />

      <header className="topbar">
        <div className="topbar__brand">
          <NavLink to="/" className="brand brand--link" aria-label="DealBazaar home">
            <div className="brand__mark" aria-hidden="true">
              <img src="/favicon.svg" alt="" className="brand__mark-image" />
            </div>
            <div>
              <p className="brand__name">DealBazaar</p>
              <p className="brand__subtext">Verified local commerce.</p>
            </div>
          </NavLink>
        </div>

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
          <NavLink
            to="/stores"
            className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
          >
            Stores
          </NavLink>
          {currentUser?.role === 'admin' ? (
            <NavLink
              to="/admin"
              className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
            >
              Admin
            </NavLink>
          ) : null}
          {currentUser && currentUser.role !== 'admin' ? (
            <NavLink
              to="/store"
              className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
            >
              Store
            </NavLink>
          ) : null}
        </nav>

        <div className="topbar__actions">
          <NavLink to="/deals" className="button button--ghost topbar__browse topbar__desktop-only">
            Browse deals
          </NavLink>

          {currentUser ? (
            <>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `topbar__account topbar__account--link topbar__desktop-only${
                    isActive ? ' topbar__account--active' : ''
                  }`
                }
              >
                {currentUser.name || currentUser.email}
              </NavLink>
              <button
                type="button"
                className="button button--secondary topbar__desktop-only"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="button button--secondary topbar__desktop-only">
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

          <button
            type="button"
            className="topbar__menu-toggle"
            onClick={() => {
              setIsMobileNavOpen((open) => !open);
            }}
            aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-site-nav"
          >
            {isMobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div
          id="mobile-site-nav"
          className={`mobile-nav${isMobileNavOpen ? ' mobile-nav--open' : ''}`}
        >
          <nav className="mobile-nav__links" aria-label="Mobile navigation">
            <NavLink to="/" end className={({ isActive }) => `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`}>
              Home
            </NavLink>
            <NavLink
              to="/deals"
              className={({ isActive }) => `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`}
            >
              Deals
            </NavLink>
            <NavLink
              to="/stores"
              className={({ isActive }) => `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`}
            >
              Stores
            </NavLink>
            {currentUser?.role === 'admin' ? (
              <NavLink
                to="/admin"
                className={({ isActive }) => `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`}
              >
                Admin
              </NavLink>
            ) : null}
            {currentUser && currentUser.role !== 'admin' ? (
              <NavLink
                to="/store"
                className={({ isActive }) => `mobile-nav__link${isActive ? ' mobile-nav__link--active' : ''}`}
              >
                Store
              </NavLink>
            ) : null}
          </nav>

          <div className="mobile-nav__actions">
            <NavLink to="/deals" className="button button--ghost">
              Browse deals
            </NavLink>

            {currentUser ? (
              <>
                <NavLink to="/account" className="topbar__account topbar__account--link">
                  {currentUser.name || currentUser.email}
                </NavLink>
                <button type="button" className="button button--secondary" onClick={handleSignOut}>
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/login" className="button button--secondary">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <div className="app-content">{children}</div>
    </div>
  );
}
