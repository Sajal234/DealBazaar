import { Compass, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage({ currentUser }) {
  return (
    <main className="page-shell not-found-page">
      <section className="state-card state-card--error not-found-card" aria-live="polite">
        <SearchX size={20} />
        <div>
          <p className="page-header__eyebrow">404</p>
          <h2>We could not find that page.</h2>
          <p>
            The link may be outdated, incomplete, or no longer available. Use one of the routes below to get back
            into the marketplace.
          </p>

          <div className="state-card__actions not-found-card__actions">
            <Link to="/" className="button button--primary">
              <Compass size={16} />
              Go home
            </Link>
            <Link to="/deals" className="button button--secondary">
              Browse deals
            </Link>
            <Link to="/stores" className="button button--secondary">
              Browse stores
            </Link>
            {currentUser ? (
              <Link to="/account" className="button button--ghost">
                Open account
              </Link>
            ) : (
              <Link to="/login" className="button button--ghost">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
