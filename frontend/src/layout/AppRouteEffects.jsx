import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const routeTitleRules = [
  { pattern: '/', end: true, title: 'Verified Local Deals Near You | DealBazaar' },
  { pattern: '/deals', end: true, title: 'Browse Verified Deals | DealBazaar' },
  { pattern: '/deals/:dealId', title: 'Deal Details | DealBazaar' },
  { pattern: '/stores', end: true, title: 'Browse Verified Stores | DealBazaar' },
  { pattern: '/stores/:storeId', title: 'Store Details | DealBazaar' },
  { pattern: '/login', end: true, title: 'Sign In | DealBazaar' },
  { pattern: '/signup', end: true, title: 'Create Account | DealBazaar' },
  { pattern: '/account', end: true, title: 'Your Account | DealBazaar' },
  { pattern: '/store', end: true, title: 'Seller Workspace | DealBazaar' },
  { pattern: '/admin', end: true, title: 'Admin Moderation | DealBazaar' },
];

const defaultTitle = 'Page Not Found | DealBazaar';

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
