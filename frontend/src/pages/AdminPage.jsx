import { useEffect, useState } from 'react';
import { AlertCircle, BadgeCheck, Clock3, LoaderCircle, ShieldAlert, ShieldCheck, Store as StoreIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminConfirmActionButton } from '../features/admin/AdminConfirmActionButton';
import { AdminDealMedia } from '../features/admin/AdminDealMedia';
import { AdminStoreOwnerSummary } from '../features/admin/AdminStoreOwnerSummary';
import { AdminStoreContextLinks } from '../features/admin/AdminStoreContextLinks';
import { createAdminSearchParams, readAdminSearchParams } from '../features/admin/admin.searchParams';
import {
  useActiveDealsQuery,
  useApprovedStoresQuery,
  useDealModerationMutation,
  useDealRemovalMutation,
  usePendingDealsQuery,
  usePendingStoresQuery,
  useStoreModerationMutation,
  useStoreRemovalMutation,
} from '../features/admin/admin.queries';
import { DealsPagination } from '../features/deals/DealsPagination';
import '../styles/admin.css';

const moderationCopy = {
  approveStore: 'Approve',
  rejectStore: 'Reject',
  approveDeal: 'Approve',
  rejectDeal: 'Reject',
  removeStore: 'Remove store',
  removeDeal: 'Remove deal',
};

const emptyPagination = { page: 1, pages: 1, total: 0 };

const getSafePage = (requestedPage, pagination) =>
  Math.min(Math.max(1, pagination.page || requestedPage), Math.max(1, pagination.pages || 1));

export function AdminPage({ currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readAdminSearchParams(searchParams);
  const [feedback, setFeedback] = useState('');
  const [activeAction, setActiveAction] = useState(null);

  const storesQuery = usePendingStoresQuery({ enabled: isAdmin, page: filters.storesPage, limit: 6 });
  const dealsQuery = usePendingDealsQuery({ enabled: isAdmin, page: filters.dealsPage, limit: 6 });
  const approvedStoresQuery = useApprovedStoresQuery({ enabled: isAdmin, page: filters.approvedStoresPage, limit: 6 });
  const activeDealsQuery = useActiveDealsQuery({ enabled: isAdmin, page: filters.activeDealsPage, limit: 6 });
  const storeModerationMutation = useStoreModerationMutation();
  const dealModerationMutation = useDealModerationMutation();
  const storeRemovalMutation = useStoreRemovalMutation();
  const dealRemovalMutation = useDealRemovalMutation();

  const storesPagination = storesQuery.data?.pagination || emptyPagination;
  const dealsPagination = dealsQuery.data?.pagination || emptyPagination;
  const approvedStoresPagination = approvedStoresQuery.data?.pagination || emptyPagination;
  const activeDealsPagination = activeDealsQuery.data?.pagination || emptyPagination;
  const pendingStores = storesQuery.data?.items || [];
  const pendingDeals = dealsQuery.data?.items || [];
  const approvedStores = approvedStoresQuery.data?.items || [];
  const activeDeals = activeDealsQuery.data?.items || [];

  useEffect(() => {
    const safeStoresPage = getSafePage(filters.storesPage, storesPagination);

    if (safeStoresPage !== filters.storesPage) {
      setSearchParams(
        createAdminSearchParams({
          storesPage: safeStoresPage,
          dealsPage: filters.dealsPage,
          approvedStoresPage: filters.approvedStoresPage,
          activeDealsPage: filters.activeDealsPage,
          hours: filters.hours,
        }),
        { replace: true }
      );
    }
  }, [
    filters.activeDealsPage,
    filters.approvedStoresPage,
    filters.dealsPage,
    filters.hours,
    filters.storesPage,
    setSearchParams,
    storesPagination.page,
    storesPagination.pages,
  ]);

  useEffect(() => {
    const safeDealsPage = getSafePage(filters.dealsPage, dealsPagination);

    if (safeDealsPage !== filters.dealsPage) {
      setSearchParams(
        createAdminSearchParams({
          storesPage: filters.storesPage,
          dealsPage: safeDealsPage,
          approvedStoresPage: filters.approvedStoresPage,
          activeDealsPage: filters.activeDealsPage,
          hours: filters.hours,
        }),
        { replace: true }
      );
    }
  }, [
    dealsPagination.page,
    dealsPagination.pages,
    filters.activeDealsPage,
    filters.approvedStoresPage,
    filters.dealsPage,
    filters.hours,
    filters.storesPage,
    setSearchParams,
  ]);

  useEffect(() => {
    const safeApprovedStoresPage = getSafePage(filters.approvedStoresPage, approvedStoresPagination);

    if (safeApprovedStoresPage !== filters.approvedStoresPage) {
      setSearchParams(
        createAdminSearchParams({
          storesPage: filters.storesPage,
          dealsPage: filters.dealsPage,
          approvedStoresPage: safeApprovedStoresPage,
          activeDealsPage: filters.activeDealsPage,
          hours: filters.hours,
        }),
        { replace: true }
      );
    }
  }, [
    approvedStoresPagination.page,
    approvedStoresPagination.pages,
    filters.activeDealsPage,
    filters.approvedStoresPage,
    filters.dealsPage,
    filters.hours,
    filters.storesPage,
    setSearchParams,
  ]);

  useEffect(() => {
    const safeActiveDealsPage = getSafePage(filters.activeDealsPage, activeDealsPagination);

    if (safeActiveDealsPage !== filters.activeDealsPage) {
      setSearchParams(
        createAdminSearchParams({
          storesPage: filters.storesPage,
          dealsPage: filters.dealsPage,
          approvedStoresPage: filters.approvedStoresPage,
          activeDealsPage: safeActiveDealsPage,
          hours: filters.hours,
        }),
        { replace: true }
      );
    }
  }, [
    activeDealsPagination.page,
    activeDealsPagination.pages,
    filters.activeDealsPage,
    filters.approvedStoresPage,
    filters.dealsPage,
    filters.hours,
    filters.storesPage,
    setSearchParams,
  ]);

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
        hoursValid: Number(filters.hours) || 48,
      });
      setFeedback(result.message);
    } catch (error) {
      setFeedback(error.message || 'Could not update deal status right now.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleStoreRemoval = async (storeId) => {
    setActiveAction({ type: 'remove-store', targetId: storeId });
    setFeedback('');

    try {
      const result = await storeRemovalMutation.mutateAsync({ storeId });
      setFeedback(result.message);
    } catch (error) {
      setFeedback(error.message || 'Could not remove this store right now.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleDealRemoval = async (dealId) => {
    setActiveAction({ type: 'remove-deal', targetId: dealId });
    setFeedback('');

    try {
      const result = await dealRemovalMutation.mutateAsync({ dealId });
      setFeedback(result.message);
    } catch (error) {
      setFeedback(error.message || 'Could not remove this deal right now.');
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
          <h1>Review pending and live marketplace activity.</h1>
          <p>Approve trusted sellers and offers, then pull down anything that should no longer stay public.</p>
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
          <span className="admin-overview__label">Approved stores</span>
          <strong>{approvedStoresPagination.total}</strong>
        </article>
        <article className="admin-overview__card">
          <span className="admin-overview__label">Live deals</span>
          <strong>{activeDealsPagination.total}</strong>
        </article>
        <article className="admin-overview__card">
          <span className="admin-overview__label">Deal approval window</span>
          <strong>{filters.hours} hours</strong>
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
                      <span>Application owner</span>
                    </div>

                    <AdminStoreOwnerSummary
                      ownerName={store.ownerName}
                      ownerEmail={store.ownerEmail}
                      ownerId={store.ownerId}
                    />

                    <AdminStoreContextLinks phone={store.phone} viewLabel="Open public store page" />

                    <div className="admin-card__actions">
                      <AdminConfirmActionButton
                        icon={<BadgeCheck />}
                        className="button button--primary"
                        onConfirm={() => {
                          handleStoreModeration(store.id, 'approved');
                        }}
                        disabled={isApproving || isRejecting}
                        isPending={isApproving}
                        label={moderationCopy.approveStore}
                        confirmLabel="Confirm approve"
                        pendingLabel="Approving..."
                      />
                      <AdminConfirmActionButton
                        className="button button--secondary"
                        onConfirm={() => {
                          handleStoreModeration(store.id, 'rejected');
                        }}
                        disabled={isApproving || isRejecting}
                        isPending={isRejecting}
                        label={moderationCopy.rejectStore}
                        confirmLabel="Confirm reject"
                        pendingLabel="Rejecting..."
                      />
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
                  setSearchParams(
                    createAdminSearchParams({
                      storesPage: safePage,
                      dealsPage: filters.dealsPage,
                      approvedStoresPage: filters.approvedStoresPage,
                      activeDealsPage: filters.activeDealsPage,
                      hours: filters.hours,
                    })
                  );
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
                value={filters.hours}
                onChange={(event) => {
                  setSearchParams(
                    createAdminSearchParams({
                      storesPage: filters.storesPage,
                      dealsPage: filters.dealsPage,
                      approvedStoresPage: filters.approvedStoresPage,
                      activeDealsPage: filters.activeDealsPage,
                      hours: event.target.value,
                    })
                  );
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
                    <AdminDealMedia title={deal.title} imageUrl={deal.imageUrl} imageCount={deal.imageCount} />

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

                    <AdminStoreContextLinks storeId={deal.storeId} phone={deal.storePhone} />

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
                      <AdminConfirmActionButton
                        icon={<BadgeCheck />}
                        className="button button--primary"
                        onConfirm={() => {
                          handleDealModeration(deal.id, 'active');
                        }}
                        disabled={isApproving || isRejecting}
                        isPending={isApproving}
                        label={`${moderationCopy.approveDeal} (${filters.hours}h)`}
                        confirmLabel={`Confirm approve (${filters.hours}h)`}
                        pendingLabel="Approving..."
                      />
                      <AdminConfirmActionButton
                        className="button button--secondary"
                        onConfirm={() => {
                          handleDealModeration(deal.id, 'rejected');
                        }}
                        disabled={isApproving || isRejecting}
                        isPending={isRejecting}
                        label={moderationCopy.rejectDeal}
                        confirmLabel="Confirm reject"
                        pendingLabel="Rejecting..."
                      />
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
                  setSearchParams(
                    createAdminSearchParams({
                      storesPage: filters.storesPage,
                      dealsPage: safePage,
                      approvedStoresPage: filters.approvedStoresPage,
                      activeDealsPage: filters.activeDealsPage,
                      hours: filters.hours,
                    })
                  );
                }
              }}
              isDisabled={dealsQuery.isFetching}
            />
          ) : null}
        </section>
      </div>

      <section className="admin-section-intro" aria-label="Live marketplace controls">
        <div>
          <p className="store-card__eyebrow">Live marketplace controls</p>
          <h2>Remove stores or deals after approval when needed.</h2>
          <p>These actions pull listings out of the public marketplace without hard-deleting the history.</p>
        </div>
      </section>

      <div className="admin-layout">
        <section className="admin-queue">
          <div className="admin-queue__header">
            <div>
              <p className="store-card__eyebrow">Approved stores</p>
              <h2>Verified sellers currently public</h2>
              <p>Use this when a store should no longer appear publicly or keep seller access.</p>
            </div>
          </div>

          {approvedStoresQuery.isLoading ? (
            <section className="state-card" aria-live="polite">
              <LoaderCircle size={18} className="state-card__spinner" />
              <div>
                <h2>Loading approved stores</h2>
                <p>Fetching currently verified stores from the live marketplace.</p>
              </div>
            </section>
          ) : null}

          {!approvedStoresQuery.isLoading && approvedStoresQuery.error ? (
            <section className="state-card state-card--error" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>Could not load approved stores</h2>
                <p>{approvedStoresQuery.error.message || 'Something went wrong while loading live store listings.'}</p>
                <div className="state-card__actions">
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => approvedStoresQuery.refetch()}
                  >
                    Try again
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {!approvedStoresQuery.isLoading && !approvedStoresQuery.error && approvedStores.length === 0 ? (
            <section className="state-card" aria-live="polite">
              <ShieldCheck size={18} />
              <div>
                <h2>No approved stores live right now</h2>
                <p>Once stores are approved, they will show up here for post-approval control.</p>
              </div>
            </section>
          ) : null}

          {!approvedStoresQuery.isLoading && !approvedStoresQuery.error && approvedStores.length > 0 ? (
            <div className="admin-cards">
              {approvedStores.map((store) => {
                const isRemoving = activeAction?.type === 'remove-store' && activeAction?.targetId === store.id;

                return (
                  <article key={store.id} className="admin-card">
                    <div className="admin-card__header">
                      <div>
                        <h3>{store.name}</h3>
                        <p>{store.address}</p>
                      </div>
                      <span className="admin-chip admin-chip--approved">Approved</span>
                    </div>

                    <div className="admin-card__meta">
                      <span>{store.cityLabel}, {store.stateLabel}</span>
                      <span>{store.phoneLabel}</span>
                      <span>Listed since {store.submittedAtLabel}</span>
                      <span>{store.ratingLabel}</span>
                    </div>

                    <div className="admin-card__note">
                      <ShieldCheck size={16} />
                      <span>Public store with seller access enabled</span>
                    </div>

                    <AdminStoreOwnerSummary
                      ownerName={store.ownerName}
                      ownerEmail={store.ownerEmail}
                      ownerId={store.ownerId}
                    />

                    <AdminStoreContextLinks storeId={store.id} phone={store.phone} viewLabel="Open public store page" />

                    <p className="admin-card__impact">
                      Removing this store will also pull down its currently active deals from the public marketplace.
                    </p>

                    <div className="admin-card__actions">
                      <AdminConfirmActionButton
                        icon={<ShieldAlert />}
                        className="button button--secondary"
                        onConfirm={() => {
                          handleStoreRemoval(store.id);
                        }}
                        disabled={isRemoving}
                        isPending={isRemoving}
                        label={moderationCopy.removeStore}
                        confirmLabel="Confirm remove store"
                        pendingLabel="Removing..."
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {!approvedStoresQuery.isLoading && !approvedStoresQuery.error && approvedStoresPagination.pages > 1 ? (
            <DealsPagination
              page={approvedStoresPagination.page}
              pages={approvedStoresPagination.pages}
              total={approvedStoresPagination.total}
              onPageChange={(nextPage) => {
                const safePage = Math.min(Math.max(1, nextPage), Math.max(1, approvedStoresPagination.pages || 1));

                if (safePage !== approvedStoresPagination.page) {
                  setSearchParams(
                    createAdminSearchParams({
                      storesPage: filters.storesPage,
                      dealsPage: filters.dealsPage,
                      approvedStoresPage: safePage,
                      activeDealsPage: filters.activeDealsPage,
                      hours: filters.hours,
                    })
                  );
                }
              }}
              isDisabled={approvedStoresQuery.isFetching}
            />
          ) : null}
        </section>

        <section className="admin-queue">
          <div className="admin-queue__header">
            <div>
              <p className="store-card__eyebrow">Live deals</p>
              <h2>Approved offers currently public</h2>
              <p>Use this to remove active deals that should no longer remain visible to shoppers.</p>
            </div>
          </div>

          {activeDealsQuery.isLoading ? (
            <section className="state-card" aria-live="polite">
              <LoaderCircle size={18} className="state-card__spinner" />
              <div>
                <h2>Loading live deals</h2>
                <p>Fetching active marketplace offers for post-approval review.</p>
              </div>
            </section>
          ) : null}

          {!activeDealsQuery.isLoading && activeDealsQuery.error ? (
            <section className="state-card state-card--error" aria-live="polite">
              <AlertCircle size={18} />
              <div>
                <h2>Could not load live deals</h2>
                <p>{activeDealsQuery.error.message || 'Something went wrong while loading public deals.'}</p>
                <div className="state-card__actions">
                  <button type="button" className="button button--secondary" onClick={() => activeDealsQuery.refetch()}>
                    Try again
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {!activeDealsQuery.isLoading && !activeDealsQuery.error && activeDeals.length === 0 ? (
            <section className="state-card" aria-live="polite">
              <ShieldCheck size={18} />
              <div>
                <h2>No live deals right now</h2>
                <p>Approved deals will appear here when they are active in the marketplace.</p>
              </div>
            </section>
          ) : null}

          {!activeDealsQuery.isLoading && !activeDealsQuery.error && activeDeals.length > 0 ? (
            <div className="admin-cards">
              {activeDeals.map((deal) => {
                const isRemoving = activeAction?.type === 'remove-deal' && activeAction?.targetId === deal.id;

                return (
                  <article key={deal.id} className="admin-card">
                    <AdminDealMedia title={deal.title} imageUrl={deal.imageUrl} imageCount={deal.imageCount} />

                    <div className="admin-card__header">
                      <div>
                        <h3>{deal.title}</h3>
                        <p>{deal.description}</p>
                      </div>
                      <span className="admin-chip admin-chip--live">Live</span>
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

                    <AdminStoreContextLinks storeId={deal.storeId} phone={deal.storePhone} />

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

                    <p className="admin-card__impact">
                      Removing this deal takes it out of the public marketplace while preserving moderation history.
                    </p>

                    <div className="admin-card__actions">
                      <AdminConfirmActionButton
                        icon={<ShieldAlert />}
                        className="button button--secondary"
                        onConfirm={() => {
                          handleDealRemoval(deal.id);
                        }}
                        disabled={isRemoving}
                        isPending={isRemoving}
                        label={moderationCopy.removeDeal}
                        confirmLabel="Confirm remove deal"
                        pendingLabel="Removing..."
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {!activeDealsQuery.isLoading && !activeDealsQuery.error && activeDealsPagination.pages > 1 ? (
            <DealsPagination
              page={activeDealsPagination.page}
              pages={activeDealsPagination.pages}
              total={activeDealsPagination.total}
              onPageChange={(nextPage) => {
                const safePage = Math.min(Math.max(1, nextPage), Math.max(1, activeDealsPagination.pages || 1));

                if (safePage !== activeDealsPagination.page) {
                  setSearchParams(
                    createAdminSearchParams({
                      storesPage: filters.storesPage,
                      dealsPage: filters.dealsPage,
                      approvedStoresPage: filters.approvedStoresPage,
                      activeDealsPage: safePage,
                      hours: filters.hours,
                    })
                  );
                }
              }}
              isDisabled={activeDealsQuery.isFetching}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}
