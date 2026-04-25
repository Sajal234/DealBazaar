import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const routeTitleRules = [
  { pattern: '/', end: true, title: 'Verified Local Deals Near You | DealGrab' },
  { pattern: '/deals', end: true, title: 'Browse Verified Deals | DealGrab' },
  { pattern: '/deals/:dealId', title: 'Deal Details | DealGrab' },
  { pattern: '/stores', end: true, title: 'Browse Verified Stores | DealGrab' },
  { pattern: '/stores/:storeId', title: 'Store Details | DealGrab' },
  { pattern: '/login', end: true, title: 'Sign In | DealGrab' },
  { pattern: '/signup', end: true, title: 'Create Account | DealGrab' },
  { pattern: '/forgot-password', end: true, title: 'Reset Password | DealGrab' },
  { pattern: '/reset-password/:token', title: 'Choose a New Password | DealGrab' },
  { pattern: '/account', end: true, title: 'Your Account | DealGrab' },
  { pattern: '/store', end: true, title: 'Seller Workspace | DealGrab' },
  { pattern: '/admin', end: true, title: 'Admin Moderation | DealGrab' },
];

const defaultTitle = 'Page Not Found | DealGrab';

function getRouteTitle(pathname) {
  const matchedRule = routeTitleRules.find((rule) =>
    matchPath(
      {
        path: rule.pattern,
        end: rule.end ?? false,
      },
      pathname
    )
  );

  return matchedRule?.title || defaultTitle;
}

export function AppRouteEffects() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    if (typeof document !== 'undefined') {
      document.title = getRouteTitle(location.pathname);
    }
  }, [location.pathname, location.search]);

  return null;
}
