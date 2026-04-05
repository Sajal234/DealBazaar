function getRequestedPathname(requestedLocation) {
  if (typeof requestedLocation === 'string') {
    return requestedLocation.split(/[?#]/, 1)[0] || '';
  }

  if (!requestedLocation || typeof requestedLocation !== 'object') {
    return '';
  }

  return typeof requestedLocation.pathname === 'string' ? requestedLocation.pathname : '';
}

function getRequestedPath(requestedLocation) {
  if (typeof requestedLocation === 'string') {
    return requestedLocation;
  }

  if (!requestedLocation || typeof requestedLocation !== 'object') {
    return '';
  }

  const pathname = typeof requestedLocation.pathname === 'string' ? requestedLocation.pathname : '';
  const search = typeof requestedLocation.search === 'string' ? requestedLocation.search : '';
  const hash = typeof requestedLocation.hash === 'string' ? requestedLocation.hash : '';

  return pathname ? `${pathname}${search}${hash}` : '';
}

export function getDefaultAuthenticatedPath(currentUser) {
  if (!currentUser) {
    return '/deals';
  }

  if (currentUser.role === 'admin') {
    return '/admin';
  }

  if (currentUser.role === 'store') {
    return '/store';
  }

  return '/deals';
}

export function canAccessPath(currentUser, pathname) {
  if (!currentUser || typeof pathname !== 'string' || !pathname.trim()) {
    return false;
  }

  if (pathname === '/admin') {
    return currentUser.role === 'admin';
  }

  if (pathname === '/store') {
    return currentUser.role !== 'admin';
  }

  return true;
}

export function getPostAuthPath(currentUser, requestedLocation) {
  const requestedPathname = getRequestedPathname(requestedLocation);
  const requestedPath = getRequestedPath(requestedLocation);

  if (requestedPath && canAccessPath(currentUser, requestedPathname)) {
    return requestedPath;
  }

  return getDefaultAuthenticatedPath(currentUser);
}
