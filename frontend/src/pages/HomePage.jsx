import { AlertCircle, ArrowRight, LoaderCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DealCard } from '../features/deals/DealCard';
import { useDealsQuery } from '../features/deals/deals.queries';
import { HomeSearchForm } from '../features/home/HomeSearchForm';
import { HomeVerifiedStoresList } from '../features/home/HomeVerifiedStoresList';
import { useStoresQuery } from '../features/store/store.queries';

export function HomePage() {
  const dealsQuery = useDealsQuery({ limit: 3 });
  const storesQuery = useStoresQuery({ limit: 4 });

  const deals = dealsQuery.data?.items || [];
  const stores = storesQuery.data?.items || [];

  return (
    <main className="home-storefront">
      <section className="home-hero">
        <div className="home-hero__copy">
          <div className="hero__badge">
            <Sparkles size={14} />
            <span>Verified local deals</span>
          </div>

          <h1>Shop nearby offers without the marketplace mess.</h1>
          <p>
            Browse approved offers from real stores, compare quickly, and contact the seller only
            when the deal is actually worth your time.
          </p>

          <div className="home-hero__actions">
            <Link to="/deals" className="button button--primary">
              Explore deals
              <ArrowRight size={18} />
            </Link>
            <Link to="/store" className="button button--secondary">
              Sell on DealBazaar
            </Link>
          </div>

          <HomeSearchForm />

          <ul className="home-hero__trust" aria-label="Marketplace trust signals">
            <li>Admin-approved deals</li>
            <li>Verified local stores</li>
            <li>Auto-expiring offers</li>
          </ul>
        </div>
      </section>

      <section className="home-highlights" aria-label="Marketplace highlights">
        <div className="home-highlights__item">
          <strong>48–72h</strong>
          <span>Moderated deal lifecycle</span>
        </div>
        <div className="home-highlights__item">
          <strong>1 flow</strong>
          <span>From discovery to store contact</span>
        </div>
        <div className="home-highlights__item">
          <strong>0 noise</strong>
          <span>Cleaner than crowded classifieds</span>
        </div>
        <div className="home-highlights__item">
          <strong>Trusted</strong>
          <span>Verification-first marketplace design</span>
        </div>
      </section>

      <section className="home-market" aria-label="Live marketplace">
        <div className="home-market__main">
          <div className="home-section__header">
            <div>
              <p className="preview-shell__eyebrow">Live deals</p>
              <h2>Fresh approved offers from verified stores</h2>
            </div>
            <Link to="/deals" className="home-featured__link">
              Browse all deals
              <ArrowRight size={16} />
            </Link>
          </div>

          {dealsQuery.isLoading ? (
            <section className="state-card" aria-live="polite">
              <LoaderCircle size={18} className="state-card__spinner" />
              <div>
                <h2>Loading live deals</h2>
                <p>Fetching the latest approved offers from the marketplace.</p>
              </div>
            </section>
          ) : null}

          {!dealsQuery.isLoading && dealsQuery.error ? (
            <section className="state-card state-card--error" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>Could not load live deals</h2>
                <p>{dealsQuery.error.message || 'Unable to load deals right now.'}</p>
                <div className="state-card__actions">
                  <button
                    type="button"
                    className="button button--secondary state-card__retry"
                    onClick={() => {
                      dealsQuery.refetch();
                    }}
                    disabled={dealsQuery.isRefetching}
                  >
                    {dealsQuery.isRefetching ? 'Retrying...' : 'Try again'}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {!dealsQuery.isLoading && !dealsQuery.error && deals.length === 0 ? (
            <section className="state-card" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>No live deals yet</h2>
                <p>Approved offers will appear here as the marketplace fills out.</p>
              </div>
            </section>
          ) : null}

          {!dealsQuery.isLoading && !dealsQuery.error && deals.length > 0 ? (
            <div className="deal-grid home-market__deals">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} previewTimestamp={dealsQuery.dataUpdatedAt} />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="home-market__sidebar">
          <div className="home-section__header home-section__header--stacked">
            <div>
              <p className="preview-shell__eyebrow">Verified stores</p>
              <h2>Browse real local sellers before you call</h2>
            </div>
            <Link to="/stores" className="home-featured__link">
              Browse stores
              <ArrowRight size={16} />
            </Link>
          </div>

          {storesQuery.isLoading ? (
            <section className="state-card" aria-live="polite">
              <LoaderCircle size={18} className="state-card__spinner" />
              <div>
                <h2>Loading stores</h2>
                <p>Pulling in verified retailers from the marketplace.</p>
              </div>
            </section>
          ) : null}

          {!storesQuery.isLoading && storesQuery.error ? (
            <section className="state-card state-card--error" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>Could not load stores</h2>
                <p>{storesQuery.error.message || 'Unable to load stores right now.'}</p>
                <div className="state-card__actions">
                  <button
                    type="button"
                    className="button button--secondary state-card__retry"
                    onClick={() => {
                      storesQuery.refetch();
                    }}
                    disabled={storesQuery.isRefetching}
                  >
                    {storesQuery.isRefetching ? 'Retrying...' : 'Try again'}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {!storesQuery.isLoading && !storesQuery.error && stores.length === 0 ? (
            <section className="state-card" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>No verified stores yet</h2>
                <p>Approved stores will show up here as seller applications are reviewed.</p>
              </div>
            </section>
          ) : null}

          {!storesQuery.isLoading && !storesQuery.error && stores.length > 0 ? (
            <HomeVerifiedStoresList stores={stores} />
          ) : null}
        </aside>
      </section>
    </main>
  );
}
