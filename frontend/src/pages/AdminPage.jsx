import { useEffect, useState } from 'react';
import { AlertCircle, BadgeCheck, Clock3, LoaderCircle, ShieldAlert, ShieldCheck, Store as StoreIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminDealMedia } from '../features/admin/AdminDealMedia';
import { DealsPagination } from '../features/deals/DealsPagination';
import {
  useDealModerationMutation,
  usePendingDealsQuery,
  usePendingStoresQuery,
  useStoreModerationMutation,
} from '../features/admin/admin.queries';
import '../styles/admin.css';

const moderationCopy = {
  approveStore: 'Approve',
  rejectStore: 'Reject',
  approveDeal: 'Approve',
  rejectDeal: 'Reject',
};

export function AdminPage({ currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [storesPage, setStoresPage] = useState(1);
  const [dealsPage, setDealsPage] = useState(1);
  const [dealApprovalWindowHours, setDealApprovalWindowHours] = useState('48');
  const [feedback, setFeedback] = useState('');
  const [activeAction, setActiveAction] = useState(null);

  const storesQuery = usePendingStoresQuery({ enabled: isAdmin, page: storesPage, limit: 6 });
  const dealsQuery = usePendingDealsQuery({ enabled: isAdmin, page: dealsPage, limit: 6 });
  const storeModerationMutation = useStoreModerationMutation();
  const dealModerationMutation = useDealModerationMutation();

  const storesPagination = storesQuery.data?.pagination || { page: 1, pages: 1, total: 0 };
  const dealsPagination = dealsQuery.data?.pagination || { page: 1, pages: 1, total: 0 };
  const pendingStores = storesQuery.data?.items || [];
  const pendingDeals = dealsQuery.data?.items || [];

  useEffect(() => {
    const safeStoresPage = Math.min(Math.max(1, storesPagination.page || storesPage), Math.max(1, storesPagination.pages || 1));

    if (safeStoresPage !== storesPage) {
      setStoresPage(safeStoresPage);
    }
  }, [storesPage, storesPagination.page, storesPagination.pages]);

  useEffect(() => {
    const safeDealsPage = Math.min(Math.max(1, dealsPagination.page || dealsPage), Math.max(1, dealsPagination.pages || 1));

    if (safeDealsPage !== dealsPage) {
      setDealsPage(safeDealsPage);
    }
  }, [dealsPage, dealsPagination.page, dealsPagination.pages]);

  const handleStoreModeration = async (storeId, status) => {
    setActiveAction({ type: 'store', targetId: storeId, status });
    setFeedback('');

    try {
      const result = await storeModerationMutation.mutateAsync({ storeId, status });
      setFeedback(result.message);
    } catch (error) {
      setFeedback(error.message || 'Could not update store status right now.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleDealModeration = async (dealId, status) => {
    setActiveAction({ type: 'deal', targetId: dealId, status });
    setFeedback('');

    try {
      const result = await dealModerationMutation.mutateAsync({
        dealId,
        status,
        hoursValid: Number(dealApprovalWindowHours) || 48,
      });
      setFeedback(result.message);
    } catch (error) {
      setFeedback(error.message || 'Could not update deal status right now.');
    } finally {
      setActiveAction(null);
    }
  };

  if (!isAdmin) {
    return (
      <main className="page-shell">
        <section className="state-card state-card--error" aria-live="polite">
          <ShieldAlert size={18} />
          <div>
            <h2>Admin access only</h2>
            <p>This moderation workspace is only available to administrator accounts.</p>
            <div className="state-card__actions">
              <Link to="/deals" className="button button--secondary">
                Back to deals
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell admin-page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Admin moderation</p>
          <h1>Review pending stores and deals.</h1>
          <p>Keep the marketplace credible by approving only verified sellers and valid listings.</p>
        </div>
      </section>

      {feedback ? (
        <p className="admin-feedback" role="status">
          {feedback}
        </p>
      ) : null}

      <section className="admin-overview" aria-label="Moderation summary">
        <article className="admin-overview__card">
          <span className="admin-overview__label">Pending stores</span>
          <strong>{storesPagination.total}</strong>
        </article>
        <article className="admin-overview__card">
          <span className="admin-overview__label">Pending deals</span>
          <strong>{dealsPagination.total}</strong>
        </article>
        <article className="admin-overview__card">
          <span className="admin-overview__label">Deal approval window</span>
          <strong>{dealApprovalWindowHours} hours</strong>
        </article>
      </section>

      <div className="admin-layout">
        <section className="admin-queue">
          <div className="admin-queue__header">
            <div>
              <p className="store-card__eyebrow">Store applications</p>
              <h2>Pending seller verification</h2>
              <p>Approve real local stores and reject incomplete or untrusted submissions.</p>
            </div>
          </div>

          {storesQuery.isLoading ? (
            <section className="state-card" aria-live="polite">
              <LoaderCircle size={18} className="state-card__spinner" />
              <div>
                <h2>Loading pending stores</h2>
                <p>Fetching the next batch of seller applications for review.</p>
              </div>
            </section>
          ) : null}

          {!storesQuery.isLoading && storesQuery.error ? (
            <section className="state-card state-card--error" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>Could not load pending stores</h2>
                <p>{storesQuery.error.message || 'Something went wrong while loading store applications.'}</p>
                <div className="state-card__actions">
                  <button type="button" className="button button--secondary" onClick={() => storesQuery.refetch()}>
                    Try again
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {!storesQuery.isLoading && !storesQuery.error && pendingStores.length === 0 ? (
            <section className="state-card" aria-live="polite">
              <ShieldCheck size={18} />
              <div>
                <h2>No pending store applications</h2>
                <p>New seller applications will appear here when review is required.</p>
              </div>
            </section>
          ) : null}

          {!storesQuery.isLoading && !storesQuery.error && pendingStores.length > 0 ? (
            <div className="admin-cards">
              {pendingStores.map((store) => {
                const isApproving =
                  activeAction?.type === 'store' && activeAction?.targetId === store.id && activeAction?.status === 'approved';
                const isRejecting =
                  activeAction?.type === 'store' && activeAction?.targetId === store.id && activeAction?.status === 'rejected';

                return (
                  <article key={store.id} className="admin-card">
                    <div className="admin-card__header">
                      <div>
                        <h3>{store.name}</h3>
                        <p>{store.address}</p>
                      </div>
                      <span className="admin-chip admin-chip--pending">Pending</span>
                    </div>

                    <div className="admin-card__meta">
                      <span>{store.cityLabel}, {store.stateLabel}</span>
                      <span>{store.phoneLabel}</span>
                      <span>Submitted {store.submittedAtLabel}</span>
                      <span>{store.ratingLabel}</span>
                    </div>

                    <div className="admin-card__note">
                      <StoreIcon size={16} />
                      <span>Owner ID: {store.ownerId}</span>
                    </div>

                    <div className="admin-card__actions">
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => {
                          handleStoreModeration(store.id, 'approved');
                        }}
                        disabled={isApproving || isRejecting}
                      >
                        <BadgeCheck size={16} />
                        {isApproving ? 'Approving...' : moderationCopy.approveStore}
                      </button>
                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => {
                          handleStoreModeration(store.id, 'rejected');
                        }}
                        disabled={isApproving || isRejecting}
                      >
                        {isRejecting ? 'Rejecting...' : moderationCopy.rejectStore}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {!storesQuery.isLoading && !storesQuery.error && storesPagination.pages > 1 ? (
            <DealsPagination
              page={storesPagination.page}
              pages={storesPagination.pages}
              total={storesPagination.total}
              onPageChange={(nextPage) => {
                const safePage = Math.min(Math.max(1, nextPage), Math.max(1, storesPagination.pages || 1));

                if (safePage !== storesPagination.page) {
                  setStoresPage(safePage);
                }
              }}
              isDisabled={storesQuery.isFetching}
            />
          ) : null}
        </section>

        <section className="admin-queue">
          <div className="admin-queue__header admin-queue__header--split">
            <div>
              <p className="store-card__eyebrow">Deal moderation</p>
              <h2>Pending listing approvals</h2>
              <p>Approve genuine offers quickly and reject anything that should not go live.</p>
            </div>

            <label className="admin-window-field">
              <span className="admin-window-field__label">Active for</span>
              <select
                value={dealApprovalWindowHours}
                onChange={(event) => {
                  setDealApprovalWindowHours(event.target.value);
                }}
              >
                <option value="24">24h</option>
                <option value="48">48h</option>
                <option value="72">72h</option>
              </select>
            </label>
          </div>

          {dealsQuery.isLoading ? (
            <section className="state-card" aria-live="polite">
              <LoaderCircle size={18} className="state-card__spinner" />
              <div>
                <h2>Loading pending deals</h2>
                <p>Pulling the next set of store listings waiting for moderation.</p>
              </div>
            </section>
          ) : null}

          {!dealsQuery.isLoading && dealsQuery.error ? (
            <section className="state-card state-card--error" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>Could not load pending deals</h2>
                <p>{dealsQuery.error.message || 'Something went wrong while loading deal moderation items.'}</p>
                <div className="state-card__actions">
                  <button type="button" className="button button--secondary" onClick={() => dealsQuery.refetch()}>
                    Try again
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {!dealsQuery.isLoading && !dealsQuery.error && pendingDeals.length === 0 ? (
            <section className="state-card" aria-live="polite">
              <ShieldCheck size={18} />
              <div>
                <h2>No pending deals</h2>
                <p>Fresh submissions will appear here when they are waiting for approval.</p>
              </div>
            </section>
          ) : null}

          {!dealsQuery.isLoading && !dealsQuery.error && pendingDeals.length > 0 ? (
            <div className="admin-cards">
              {pendingDeals.map((deal) => {
                const isApproving =
                  activeAction?.type === 'deal' && activeAction?.targetId === deal.id && activeAction?.status === 'active';
                const isRejecting =
                  activeAction?.type === 'deal' && activeAction?.targetId === deal.id && activeAction?.status === 'rejected';

                return (
                  <article key={deal.id} className="admin-card">
                    <AdminDealMedia
                      title={deal.title}
                      imageUrl={deal.imageUrl}
                      imageCount={deal.imageCount}
                    />

                    <div className="admin-card__header">
                      <div>
                        <h3>{deal.title}</h3>
                        <p>{deal.description}</p>
                      </div>
                      <span className="admin-chip admin-chip--pending">Pending</span>
                    </div>

                    <div className="admin-card__meta">
                      <span>{deal.priceLabel}</span>
                      <span>{deal.cityLabel}</span>
                      <span>Submitted {deal.submittedAtLabel}</span>
                      <span>Updated {deal.updatedAtLabel}</span>
                    </div>

                    <div className="admin-card__note">
                      <BadgeCheck size={16} />
                      <span>
                        {deal.storeName} • {deal.storeCityLabel} • {deal.storeRatingLabel}
                      </span>
                    </div>

                    <div className="admin-card__metrics">
                      <span>
                        <Clock3 size={14} />
                        {deal.views} views
                      </span>
                      <span>
                        <ShieldCheck size={14} />
                        {deal.clicks} clicks
                      </span>
                      <span>{deal.imageCount} image{deal.imageCount === 1 ? '' : 's'}</span>
                    </div>

                    <div className="admin-card__actions">
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => {
                          handleDealModeration(deal.id, 'active');
                        }}
                        disabled={isApproving || isRejecting}
                      >
                        <BadgeCheck size={16} />
                        {isApproving ? 'Approving...' : `${moderationCopy.approveDeal} (${dealApprovalWindowHours}h)`}
                      </button>
                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => {
                          handleDealModeration(deal.id, 'rejected');
                        }}
                        disabled={isApproving || isRejecting}
                      >
                        {isRejecting ? 'Rejecting...' : moderationCopy.rejectDeal}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {!dealsQuery.isLoading && !dealsQuery.error && dealsPagination.pages > 1 ? (
            <DealsPagination
              page={dealsPagination.page}
              pages={dealsPagination.pages}
              total={dealsPagination.total}
              onPageChange={(nextPage) => {
                const safePage = Math.min(Math.max(1, nextPage), Math.max(1, dealsPagination.pages || 1));

                if (safePage !== dealsPagination.page) {
                  setDealsPage(safePage);
                }
              }}
              isDisabled={dealsQuery.isFetching}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
