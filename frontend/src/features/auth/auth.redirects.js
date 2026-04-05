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

export function getPostAuthPath(currentUser, requestedPathname) {
  if (canAccessPath(currentUser, requestedPathname)) {
    return requestedPathname;
  }

  return getDefaultAuthenticatedPath(currentUser);
}
