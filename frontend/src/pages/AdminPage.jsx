import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MaterialIcon, StitchBottomNav, StitchDesktopHeader, StitchMobileHeader } from '../components/StitchChrome';
import { StitchAvatar, StitchMediaFrame } from '../components/StitchDataVisuals';
import { createAdminSearchParams, readAdminSearchParams } from '../features/admin/admin.searchParams';
import {
  useActiveDealsQuery,
  useApprovedStoresQuery,
  useDealModerationMutation,
  usePendingDealsQuery,
  usePendingStoresQuery,
  useStoreModerationMutation,
} from '../features/admin/admin.queries';
import { DealsPagination } from '../features/deals/DealsPagination';

function ModerationState({ currentUser, title, description }) {
  return (
    <div className="stitch-page">
      <StitchDesktopHeader active="workspace" currentUser={currentUser} />
      <main className="stitch-canvas stitch-canvas--admin">
        <section className="stitch-state-card">
          <div className="stitch-state-card__icon">
            <MaterialIcon name="gavel" />
          </div>
          <div className="stitch-state-card__copy">
            <h2>{title}</h2>
            <p>{description}</p>
            <Link to="/deals" className="stitch-pill-button stitch-pill-button--primary">
              Back to Deals
            </Link>
          </div>
        </section>
      </main>
      <StitchBottomNav active="workspace" currentUser={currentUser} />
    </div>
  );
}

function QueueState({ title, description, tone = 'default' }) {
  return (
    <section className={`stitch-state-card${tone === 'error' ? ' stitch-state-card--error' : ''}`}>
      <div className="stitch-state-card__icon">
        <MaterialIcon name={tone === 'error' ? 'warning' : 'inventory_2'} />
      </div>
      <div className="stitch-state-card__copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}

function PendingStoreCard({ store, onApprove, onReject, isPending }) {
  return (
    <article className="stitch-admin-card stitch-admin-card--textual">
      <div className="stitch-admin-card__body">
        <div className="stitch-admin-card__heading">
          <div className="stitch-admin-card__title-cluster">
            <StitchAvatar label={store.name} size="sm" className="stitch-admin-card__avatar" />
            <div>
              <h3>{store.name}</h3>
              <p>{store.address || `${store.cityLabel}, ${store.stateLabel}`}</p>
            </div>
          </div>

          <span className="stitch-admin-card__status">
            <MaterialIcon name="storefront" className="stitch-admin-card__status-icon" />
            <span>Pending Store</span>
          </span>
        </div>

        <div className="stitch-admin-card__grid">
          <div>
            <small>Location</small>
            <strong>{store.cityLabel}, {store.stateLabel}</strong>
          </div>
          <div>
            <small>Contact</small>
            <strong>{store.phoneLabel}</strong>
          </div>
        </div>

        <div className="stitch-admin-card__actions">
          <button type="button" className="stitch-action-button stitch-action-button--secondary stitch-action-button--full" onClick={onReject} disabled={isPending}>
            Reject
          </button>
          <button type="button" className="stitch-action-button stitch-action-button--primary stitch-action-button--full" onClick={onApprove} disabled={isPending}>
            {isPending ? 'Updating...' : 'Approve Store'}
          </button>
        </div>
      </div>
    </article>
  );
}

function PendingDealCard({ deal, onApprove, onReject, isPending }) {
  const alertMessage =
    deal.storeIsVerified
      ? 'Merchant is already verified. Review the description and expiry window before approval.'
      : 'Store identity is not yet verified. Review authenticity carefully before approval.';

  return (
    <article className="stitch-admin-card">
      <div className="stitch-admin-card__split">
        <div className="stitch-admin-card__media">
          <StitchMediaFrame
            src={deal.imageUrl}
            alt={deal.title}
            title={deal.title}
            subtitle="No product photo uploaded"
            icon="sell"
          />
        </div>

        <div className="stitch-admin-card__body">
          <div>
            <div className="stitch-admin-card__heading">
              <h3>{deal.title}</h3>
              <span className="stitch-admin-card__status">
                <MaterialIcon name="sell" className="stitch-admin-card__status-icon" />
                <span>Pending Deal</span>
              </span>
            </div>

            <p>{deal.description}</p>

            <div className="stitch-admin-card__grid">
              <div>
                <small>Store</small>
                <strong>{deal.storeName}</strong>
              </div>
              <div>
                <small>Offer</small>
                <strong>{deal.priceLabel}</strong>
              </div>
            </div>
          </div>

          <div className="stitch-admin-flag">
            <MaterialIcon name="warning" className="stitch-admin-flag__icon" />
            <p>{alertMessage}</p>
          </div>

          <div className="stitch-admin-card__actions">
            <button type="button" className="stitch-action-button stitch-action-button--secondary stitch-action-button--full" onClick={onReject} disabled={isPending}>
              Reject
            </button>
            <button type="button" className="stitch-action-button stitch-action-button--primary stitch-action-button--full" onClick={onApprove} disabled={isPending}>
              {isPending ? 'Updating...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AdminPage({ currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readAdminSearchParams(searchParams);
  const [feedback, setFeedback] = useState('');
  const [activeAction, setActiveAction] = useState(null);

  const storesQuery = usePendingStoresQuery({ enabled: isAdmin, page: filters.storesPage, limit: 3 });
  const dealsQuery = usePendingDealsQuery({ enabled: isAdmin, page: filters.dealsPage, limit: 4 });
  const approvedStoresQuery = useApprovedStoresQuery({ enabled: isAdmin, page: 1, limit: 1 });
  const activeDealsQuery = useActiveDealsQuery({ enabled: isAdmin, page: 1, limit: 1 });
  const storeModerationMutation = useStoreModerationMutation();
  const dealModerationMutation = useDealModerationMutation();

  const pendingStores = storesQuery.data?.items || [];
  const pendingDeals = dealsQuery.data?.items || [];
  const pendingStoresPagination = storesQuery.data?.pagination || { page: 1, pages: 1, total: 0 };
  const pendingDealsPagination = dealsQuery.data?.pagination || { page: 1, pages: 1, total: 0 };
  const approvedStoreTotal = approvedStoresQuery.data?.pagination?.total || 0;
  const activeDealTotal = activeDealsQuery.data?.pagination?.total || 0;

  useEffect(() => {
    const safeStoresPage = Math.min(Math.max(1, pendingStoresPagination.page || filters.storesPage), Math.max(1, pendingStoresPagination.pages || 1));
    const safeDealsPage = Math.min(Math.max(1, pendingDealsPagination.page || filters.dealsPage), Math.max(1, pendingDealsPagination.pages || 1));

    if (safeStoresPage !== filters.storesPage || safeDealsPage !== filters.dealsPage) {
      setSearchParams(
        createAdminSearchParams({
          storesPage: safeStoresPage,
          dealsPage: safeDealsPage,
          approvedStoresPage: 1,
          activeDealsPage: 1,
          hours: filters.hours,
        }),
        { replace: true }
      );
    }
  }, [
    filters.dealsPage,
    filters.hours,
    filters.storesPage,
    pendingDealsPagination.page,
    pendingDealsPagination.pages,
    pendingStoresPagination.page,
    pendingStoresPagination.pages,
    setSearchParams,
  ]);

  const handleStoreModeration = async (storeId, status) => {
    setActiveAction({ type: 'store', targetId: storeId, status });
    setFeedback('');

    try {
      const result = await storeModerationMutation.mutateAsync({ storeId, status });
      setFeedback(result.message);
    } catch (mutationError) {
      setFeedback(mutationError.message || 'Could not update store status right now.');
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
    } catch (mutationError) {
      setFeedback(mutationError.message || 'Could not update deal status right now.');
    } finally {
      setActiveAction(null);
    }
  };

  if (!isAdmin) {
    return (
      <ModerationState
        currentUser={currentUser}
        title="Admin access only"
        description="This moderation workspace is only available to administrator accounts."
      />
    );
  }

  return (
    <>
      <div className="stitch-page stitch-page--desktop">
        <StitchDesktopHeader active="workspace" currentUser={currentUser} />

        <main className="stitch-canvas stitch-canvas--admin">
          <div className="stitch-section__header">
            <div>
              <h1>Moderation Queue</h1>
              <p>Review pending stores and deals to keep the marketplace accurate, verified, and current.</p>
            </div>
          </div>

          {feedback ? <p className="stitch-feedback-banner">{feedback}</p> : null}

          <section className="stitch-merchant-stats">
            <div className="stitch-merchant-stat-card">
              <span>Pending Stores</span>
              <strong>{pendingStoresPagination.total}</strong>
            </div>
            <div className="stitch-merchant-stat-card">
              <span>Pending Deals</span>
              <strong>{pendingDealsPagination.total}</strong>
            </div>
          </section>

          <div className="stitch-admin-grid">
            <div className="stitch-admin-main">
              <section className="stitch-section">
                <div className="stitch-section__header stitch-section__header--bordered">
                  <div>
                    <h2>Pending Stores</h2>
                    <p>{pendingStoresPagination.total} applications waiting for review.</p>
                  </div>
                </div>

                {storesQuery.isLoading ? (
                  <QueueState title="Loading pending stores" description="Fetching seller applications awaiting moderation." />
                ) : null}

                {!storesQuery.isLoading && storesQuery.error ? (
                  <QueueState title="Could not load pending stores" description={storesQuery.error.message || 'Please try again in a moment.'} tone="error" />
                ) : null}

                {!storesQuery.isLoading && !storesQuery.error && pendingStores.length === 0 ? (
                  <QueueState title="No pending stores" description="All current store applications have already been reviewed." />
                ) : null}

                {!storesQuery.isLoading && !storesQuery.error && pendingStores.length > 0 ? (
                  pendingStores.map((store) => (
                    <PendingStoreCard
                      key={store.id}
                      store={store}
                      onApprove={() => {
                        handleStoreModeration(store.id, 'approved');
                      }}
                      onReject={() => {
                        handleStoreModeration(store.id, 'rejected');
                      }}
                      isPending={activeAction?.type === 'store' && activeAction?.targetId === store.id}
                    />
                  ))
                ) : null}

                {pendingStoresPagination.pages > 1 ? (
                  <DealsPagination
                    page={pendingStoresPagination.page}
                    pages={pendingStoresPagination.pages}
                    total={pendingStoresPagination.total}
                    onPageChange={(nextPage) => {
                      setSearchParams(
                        createAdminSearchParams({
                          storesPage: nextPage,
                          dealsPage: filters.dealsPage,
                          approvedStoresPage: 1,
                          activeDealsPage: 1,
                          hours: filters.hours,
                        })
                      );
                    }}
                  />
                ) : null}
              </section>

              <section className="stitch-section">
                <div className="stitch-section__header stitch-section__header--bordered">
                  <div>
                    <h2>Pending Deals</h2>
                    <p>{pendingDealsPagination.total} listings waiting for approval.</p>
                  </div>
                </div>

                {dealsQuery.isLoading ? (
                  <QueueState title="Loading pending deals" description="Fetching listings awaiting moderation." />
                ) : null}

                {!dealsQuery.isLoading && dealsQuery.error ? (
                  <QueueState title="Could not load pending deals" description={dealsQuery.error.message || 'Please try again in a moment.'} tone="error" />
                ) : null}

                {!dealsQuery.isLoading && !dealsQuery.error && pendingDeals.length === 0 ? (
                  <QueueState title="No pending deals" description="All current deal submissions have already been reviewed." />
                ) : null}

                {!dealsQuery.isLoading && !dealsQuery.error && pendingDeals.length > 0 ? (
                  pendingDeals.map((deal) => (
                    <PendingDealCard
                      key={deal.id}
                      deal={deal}
                      onApprove={() => {
                        handleDealModeration(deal.id, 'active');
                      }}
                      onReject={() => {
                        handleDealModeration(deal.id, 'rejected');
                      }}
                      isPending={activeAction?.type === 'deal' && activeAction?.targetId === deal.id}
                    />
                  ))
                ) : null}

                {pendingDealsPagination.pages > 1 ? (
                  <DealsPagination
                    page={pendingDealsPagination.page}
                    pages={pendingDealsPagination.pages}
                    total={pendingDealsPagination.total}
                    onPageChange={(nextPage) => {
                      setSearchParams(
                        createAdminSearchParams({
                          storesPage: filters.storesPage,
                          dealsPage: nextPage,
                          approvedStoresPage: 1,
                          activeDealsPage: 1,
                          hours: filters.hours,
                        })
                      );
                    }}
                  />
                ) : null}
              </section>
            </div>

            <aside className="stitch-admin-sidepanel">
              <div className="stitch-admin-metric-card">
                <MaterialIcon name="verified_user" className="stitch-admin-metric-card__watermark" />
                <h4>Marketplace Status</h4>
                <div className="stitch-admin-metric-card__bars">
                  <div>
                    <div>
                      <span>Approved Stores</span>
                      <strong>{approvedStoreTotal}</strong>
                    </div>
                    <div className="stitch-admin-progress">
                      <span style={{ width: `${Math.min(100, Math.max(12, approvedStoreTotal * 4))}%` }} />
                    </div>
                  </div>
                  <div>
                    <div>
                      <span>Active Deals</span>
                      <strong>{activeDealTotal}</strong>
                    </div>
                    <div className="stitch-admin-progress">
                      <span style={{ width: `${Math.min(100, Math.max(12, activeDealTotal * 2))}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="stitch-admin-filter-card">
                <h4>Approval Window</h4>
                <p className="stitch-admin-filter-card__copy">Choose how long approved deals should stay active by default.</p>
                <div className="stitch-chip-row stitch-chip-row--wrap">
                  {['24', '48', '72'].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      className={`stitch-chip-button${filters.hours === hours ? ' stitch-chip-button--active' : ''}`}
                      onClick={() => {
                        setSearchParams(
                          createAdminSearchParams({
                            storesPage: filters.storesPage,
                            dealsPage: filters.dealsPage,
                            approvedStoresPage: 1,
                            activeDealsPage: 1,
                            hours,
                          })
                        );
                      }}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>

        <StitchBottomNav active="workspace" currentUser={currentUser} />
      </div>

      <div className="stitch-page stitch-page--mobile">
        <StitchMobileHeader
          currentUser={currentUser}
          title="Moderation"
          subtitle="Pending stores and deals"
        />

        <main className="stitch-canvas stitch-canvas--mobile-admin">
          <section className="stitch-section">
            <div className="stitch-section__header">
              <div>
                <h1>Moderation Queue</h1>
                <p>Pending stores: {pendingStoresPagination.total}. Pending deals: {pendingDealsPagination.total}.</p>
              </div>
            </div>

            {feedback ? <p className="stitch-feedback-banner">{feedback}</p> : null}
          </section>

          <section className="stitch-merchant-stats">
            <div className="stitch-merchant-stat-card">
              <span>Approved Stores</span>
              <strong>{approvedStoreTotal}</strong>
            </div>
            <div className="stitch-merchant-stat-card">
              <span>Active Deals</span>
              <strong>{activeDealTotal}</strong>
            </div>
          </section>

          <section className="stitch-admin-filter-card">
            <h4>Approval Window</h4>
            <div className="stitch-chip-row stitch-chip-row--wrap">
              {['24', '48', '72'].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  className={`stitch-chip-button${filters.hours === hours ? ' stitch-chip-button--active' : ''}`}
                  onClick={() => {
                    setSearchParams(
                      createAdminSearchParams({
                        storesPage: filters.storesPage,
                        dealsPage: filters.dealsPage,
                        approvedStoresPage: 1,
                        activeDealsPage: 1,
                        hours,
                      })
                    );
                  }}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </section>

          <section className="stitch-section">
            <div className="stitch-section__header">
              <h2>Pending Stores</h2>
            </div>

            {storesQuery.isLoading ? (
              <QueueState title="Loading pending stores" description="Fetching seller applications awaiting moderation." />
            ) : null}

            {!storesQuery.isLoading && storesQuery.error ? (
              <QueueState title="Could not load pending stores" description={storesQuery.error.message || 'Please try again in a moment.'} tone="error" />
            ) : null}

            {!storesQuery.isLoading && !storesQuery.error && pendingStores.length === 0 ? (
              <QueueState title="No pending stores" description="All current store applications have already been reviewed." />
            ) : null}

            {!storesQuery.isLoading && !storesQuery.error && pendingStores.length > 0 ? (
              pendingStores.map((store) => (
                <PendingStoreCard
                  key={store.id}
                  store={store}
                  onApprove={() => {
                    handleStoreModeration(store.id, 'approved');
                  }}
                  onReject={() => {
                    handleStoreModeration(store.id, 'rejected');
                  }}
                  isPending={activeAction?.type === 'store' && activeAction?.targetId === store.id}
                />
              ))
            ) : null}
          </section>

          <section className="stitch-section">
            <div className="stitch-section__header">
              <h2>Pending Deals</h2>
            </div>

            {dealsQuery.isLoading ? (
              <QueueState title="Loading pending deals" description="Fetching listings awaiting moderation." />
            ) : null}

            {!dealsQuery.isLoading && dealsQuery.error ? (
              <QueueState title="Could not load pending deals" description={dealsQuery.error.message || 'Please try again in a moment.'} tone="error" />
            ) : null}

            {!dealsQuery.isLoading && !dealsQuery.error && pendingDeals.length === 0 ? (
              <QueueState title="No pending deals" description="All current deal submissions have already been reviewed." />
            ) : null}

            {!dealsQuery.isLoading && !dealsQuery.error && pendingDeals.length > 0 ? (
              pendingDeals.map((deal) => (
                <PendingDealCard
                  key={deal.id}
                  deal={deal}
                  onApprove={() => {
                    handleDealModeration(deal.id, 'active');
                  }}
                  onReject={() => {
                    handleDealModeration(deal.id, 'rejected');
                  }}
                  isPending={activeAction?.type === 'deal' && activeAction?.targetId === deal.id}
                />
              ))
            ) : null}
          </section>
        </main>

        <StitchBottomNav active="workspace" currentUser={currentUser} />
      </div>
    </>
  );
}
