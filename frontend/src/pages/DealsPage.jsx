import { AlertCircle, LoaderCircle, Search } from 'lucide-react';
import { DealCard } from '../features/deals/DealCard';
import { useDealsQuery } from '../features/deals/deals.queries';

export function DealsPage() {
  const { data, isLoading, error } = useDealsQuery({ limit: 12 });
  const deals = data?.items || [];

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Marketplace</p>
          <h1>Verified deals, pulled live from the backend.</h1>
          <p>
            This page is now using the real public deals API, so what you see here is tied to the
            actual marketplace data flow.
          </p>
        </div>
      </section>

      {isLoading ? (
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Loading live deals</h2>
            <p>Pulling the latest verified offers from the marketplace.</p>
          </div>
        </section>
      ) : null}

      {!isLoading && error ? (
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h2>Could not load deals</h2>
            <p>{error.message || 'Unable to load deals right now.'}</p>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && deals.length === 0 ? (
        <section className="state-card" aria-live="polite">
          <Search size={18} />
          <div>
            <h2>No live deals yet</h2>
            <p>Approved offers will appear here as soon as stores publish them.</p>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && deals.length > 0 ? (
        <section className="deal-grid" aria-label="Live deals">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
