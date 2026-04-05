import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultAuthenticatedPath } from './auth.redirects';

export function RequireRole({ children, currentUser, allow, deny }) {
  const location = useLocation();
  const allowedRoles = Array.isArray(allow) ? allow : null;
  const deniedRoles = Array.isArray(deny) ? deny : null;
  const currentRole = currentUser?.role;

  const isDenied =
    (allowedRoles && !allowedRoles.includes(currentRole)) ||
    (deniedRoles && deniedRoles.includes(currentRole));

  if (isDenied) {
    return (
      <Navigate
        to={getDefaultAuthenticatedPath(currentUser)}
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
