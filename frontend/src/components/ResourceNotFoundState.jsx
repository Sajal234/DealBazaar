import { SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResourceNotFoundState({
  title,
  message,
  backTo,
  backLabel,
  secondaryTo,
  secondaryLabel,
}) {
  return (
    <main className="page-shell">
      <section className="state-card state-card--error" aria-live="polite">
        <SearchX size={18} />
        <div>
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="state-card__actions">
            <Link to={backTo} className="button button--secondary">
              {backLabel}
            </Link>
            {secondaryTo && secondaryLabel ? (
              <Link to={secondaryTo} className="button button--ghost">
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
