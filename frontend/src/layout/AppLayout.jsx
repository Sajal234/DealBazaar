import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { StitchBottomNav, StitchDesktopHeader } from '../components/StitchChrome';
import { AppRouteEffects } from './AppRouteEffects';

const bareLayoutRouteMatchers = [
  /^\/$/,
  /^\/deals$/,
  /^\/deals\/[^/]+$/,
  /^\/stores$/,
  /^\/stores\/[^/]+$/,
  /^\/login$/,
  /^\/signup$/,
  /^\/forgot-password$/,
  /^\/reset-password\/[^/]+$/,
  /^\/store$/,
  /^\/admin$/,
];

function getDesktopNavActive(pathname, currentUser) {
  if (pathname.startsWith('/deals')) {
    return 'browse';
  }

  if (pathname.startsWith('/stores')) {
    return 'stores';
  }

  if (pathname.startsWith('/store') || pathname.startsWith('/admin')) {
    return 'workspace';
  }

  if (pathname.startsWith('/account')) {
    return currentUser?.role === 'admin' || currentUser?.role === 'store' ? 'workspace' : null;
  }

  return 'home';
}

function getBottomNavActive(pathname, currentUser) {
  if (pathname.startsWith('/deals')) {
    return 'explore';
  }

  if (pathname.startsWith('/stores')) {
    return 'stores';
  }

  if (pathname.startsWith('/store') || pathname.startsWith('/admin')) {
    return 'workspace';
  }

  if (pathname.startsWith('/account')) {
    return currentUser?.role === 'admin' || currentUser?.role === 'store' ? 'workspace' : null;
  }

  return 'home';
}

export function AppLayout({ children, theme, setTheme, currentUser }) {
  const location = useLocation();
  const isMarketingRoute = location.pathname === '/';
  const isBareLayoutRoute = bareLayoutRouteMatchers.some((matcher) => matcher.test(location.pathname));
  const desktopNavActive = getDesktopNavActive(location.pathname, currentUser);
  const bottomNavActive = getBottomNavActive(location.pathname, currentUser);

  void theme;
  void setTheme;

  useEffect(() => {
    document.body.dataset.layout = isMarketingRoute ? 'marketing' : 'stitch';

    return () => {
      delete document.body.dataset.layout;
    };
  }, [isMarketingRoute]);

  if (isBareLayoutRoute) {
    return (
      <div className="app-shell app-shell--bare">
        <AppRouteEffects />
        <div className="app-content">{children}</div>
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--stitched">
      <AppRouteEffects />
      <StitchDesktopHeader active={desktopNavActive} currentUser={currentUser} />
      <div className="app-content app-content--stitched">{children}</div>
      <StitchBottomNav active={bottomNavActive} currentUser={currentUser} />
    </div>
  );
}
