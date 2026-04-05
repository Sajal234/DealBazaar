import { LoaderCircle } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children, currentUser, hasSavedSession, isAuthLoading }) {
  const location = useLocation();

  if (hasSavedSession && isAuthLoading) {
    return (
      <main className="page-shell">
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Checking your account</h2>
            <p>Verifying your saved session before opening seller tools.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
