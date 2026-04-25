import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MaterialIcon, StitchBottomNav, StitchDesktopHeader, StitchMobileHeader } from '../components/StitchChrome';
import { StitchMediaFrame } from '../components/StitchDataVisuals';
import { StoreApplicationForm } from '../features/store/StoreApplicationForm';
import { StoreDealComposer } from '../features/store/StoreDealComposer';
import { StoreDealEditor } from '../features/store/StoreDealEditor';
import { createStoreDealsSearchParams, readStoreDealsSearchParams } from '../features/store/storeDeals.searchParams';
import { ownerDealStatusOptions } from '../features/store/storeDeals.filters';
import {
  useApplyForStoreMutation,
  useMyStoreQuery,
  useResubmitStoreMutation,
} from '../features/store/store.queries';
import {
  useArchiveOwnedDealMutation,
  useMyDealsQuery,
  useResubmitOwnedDealMutation,
} from '../features/store/storeDeals.queries';
import { DealsPagination } from '../features/deals/DealsPagination';

const storeStatusCopy = {
  pending: {
    label: 'Pending review',
    title: 'Your store application is under review.',
    description: 'We have your details and an admin will verify the listing before it goes live.',
  },
  approved: {
    label: 'Approved',
    title: 'Your store is live on DealGrab.',
    description: 'You are ready to manage listings and respond to moderated shopper activity.',
  },
  rejected: {
    label: 'Needs updates',
    title: 'Your store needs changes before approval.',
    description: 'Review the details below, update anything inaccurate, and resubmit for review.',
  },
};

function MerchantState({ currentUser, title, description, actionLabel = '', actionTo = '' }) {
  return (
    <div className="stitch-page">
      <StitchDesktopHeader active="workspace" currentUser={currentUser} />
      <main className="stitch-canvas stitch-canvas--merchant">
        <section className="stitch-state-card">
          <div className="stitch-state-card__icon">
            <MaterialIcon name="storefront" />
          </div>
          <div className="stitch-state-card__copy">
            <h2>{title}</h2>
            <p>{description}</p>
            {actionLabel && actionTo ? (
              <Link to={actionTo} className="stitch-pill-button stitch-pill-button--primary">
                {actionLabel}
              </Link>
            ) : null}
          </div>
        </section>
      </main>
      <StitchBottomNav active="workspace" currentUser={currentUser} />
    </div>
  );
}

function OwnerDealCard({
  deal,
  isEditing,
  isArchivePending,
  isResubmitPending,
  onToggleEdit,
  onResubmit,
  onArchive,
  onEditorSuccess,
}) {
  const canResubmit = deal.status === 'rejected' || deal.status === 'expired';

  return (
    <article className="stitch-owner-deal-card">
      <div className="stitch-owner-deal-card__media">
        <StitchMediaFrame
          src={deal.imageUrl}
          alt={deal.title}
          title={deal.title}
          subtitle="No photo uploaded"
          icon="sell"
        />
      </div>

      <div className="stitch-owner-deal-card__body">
        <div className="stitch-owner-deal-card__heading">
          <div>
            <h3>{deal.title}</h3>
            <p>{deal.priceLabel} • {deal.cityLabel}</p>
          </div>
          <button type="button" className="stitch-icon-button" onClick={onToggleEdit} aria-label={`Edit ${deal.title}`}>
            <MaterialIcon name="more_vert" />
          </button>
        </div>

        <div className="stitch-owner-deal-card__footer">
          <span className={`stitch-status-pill stitch-status-pill--${deal.statusTone}`}>{deal.statusLabel}</span>
          <span className="stitch-owner-deal-card__metric">
            <MaterialIcon name="visibility" className="stitch-owner-deal-card__metric-icon" />
            {deal.views || '--'}
          </span>
        </div>

        <div className="stitch-owner-deal-card__actions">
          <Link to={`/deals/${deal.id}`} className="stitch-action-button stitch-action-button--secondary">
            Preview
          </Link>
          <button type="button" className="stitch-action-button stitch-action-button--secondary" onClick={onToggleEdit}>
            {isEditing ? 'Close Editor' : 'Edit'}
          </button>
          {canResubmit ? (
            <button type="button" className="stitch-action-button stitch-action-button--secondary" onClick={onResubmit} disabled={isResubmitPending}>
              {isResubmitPending ? 'Resubmitting...' : 'Resubmit'}
            </button>
          ) : null}
          <button type="button" className="stitch-action-button stitch-action-button--secondary" onClick={onArchive} disabled={isArchivePending}>
            {isArchivePending ? 'Archiving...' : 'Archive'}
          </button>
        </div>

        {isEditing ? (
          <StoreDealEditor
            deal={deal}
            onClose={onToggleEdit}
            onSuccess={onEditorSuccess}
          />
        ) : null}
      </div>
    </article>
  );
}

export function StorePage({ currentUser }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readStoreDealsSearchParams(searchParams);
  const [applicationFeedback, setApplicationFeedback] = useState('');
  const [workspaceFeedback, setWorkspaceFeedback] = useState('');
  const [editingDealId, setEditingDealId] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const isAdmin = currentUser?.role === 'admin';

  const {
    data: store,
    error,
    isLoading,
    refetch,
  } = useMyStoreQuery({ enabled: Boolean(currentUser) && !isAdmin });
  const applyMutation = useApplyForStoreMutation();
  const resubmitMutation = useResubmitStoreMutation();
  const dealsQuery = useMyDealsQuery({
    enabled: Boolean(store?.status === 'approved'),
    limit: 6,
    page: filters.page,
    status: filters.status,
  });
  const activeDealsSummaryQuery = useMyDealsQuery({
    enabled: Boolean(store?.status === 'approved'),
    limit: 1,
    page: 1,
    status: 'active',
  });
  const resubmitDealMutation = useResubmitOwnedDealMutation();
  const archiveDealMutation = useArchiveOwnedDealMutation();
  const hasNoStore = error?.status === 404;

  const deals = dealsQuery.data?.items || [];
  const pagination = dealsQuery.data?.pagination || { page: 1, pages: 1, total: 0 };
  const totalViews = useMemo(() => deals.reduce((sum, deal) => sum + (deal.views || 0), 0), [deals]);
  const storeStatus = storeStatusCopy[store?.status] || storeStatusCopy.pending;

  useEffect(() => {
    if (applyMutation.isSuccess) {
      setApplicationFeedback(applyMutation.data?.message || 'Store application submitted successfully.');
    }
  }, [applyMutation.data, applyMutation.isSuccess]);

  useEffect(() => {
    if (resubmitMutation.isSuccess) {
      setApplicationFeedback(resubmitMutation.data?.message || 'Store application updated and resubmitted for review.');
    }
  }, [resubmitMutation.data, resubmitMutation.isSuccess]);

  useEffect(() => {
    const safePage = Math.min(Math.max(1, pagination.page || filters.page), Math.max(1, pagination.pages || 1));

    if (safePage !== filters.page) {
      setSearchParams(createStoreDealsSearchParams({ status: filters.status, page: safePage }), { replace: true });
    }
  }, [filters.page, filters.status, pagination.page, pagination.pages, setSearchParams]);

  const handleApply = async (normalizedForm) => {
    setApplicationFeedback('');

    try {
      await applyMutation.mutateAsync(normalizedForm);
    } catch {}
  };

  const handleResubmitStore = async (normalizedForm) => {
    setApplicationFeedback('');

    try {
      await resubmitMutation.mutateAsync(normalizedForm);
    } catch {}
  };

  const handleResubmitDeal = async (dealId) => {
    setActiveAction({ type: 'resubmit', dealId });
    setWorkspaceFeedback('');

    try {
      const result = await resubmitDealMutation.mutateAsync(dealId);
      setWorkspaceFeedback(result.message);
    } catch (submissionError) {
      setWorkspaceFeedback(submissionError.message || 'Could not resubmit this deal right now.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleArchiveDeal = async (dealId) => {
    setActiveAction({ type: 'archive', dealId });
    setWorkspaceFeedback('');

    try {
      const result = await archiveDealMutation.mutateAsync(dealId);
      setWorkspaceFeedback(result.message);
    } catch (archiveError) {
      setWorkspaceFeedback(archiveError.message || 'Could not archive this deal right now.');
    } finally {
      setActiveAction(null);
    }
  };

  if (isAdmin) {
    return (
      <MerchantState
        currentUser={currentUser}
        title="Admin account detected"
        description="The seller workspace is for store owners. Open the moderation workspace to review pending stores and deals."
        actionLabel="Open Admin Workspace"
        actionTo="/admin"
      />
    );
  }

  if (isLoading) {
    return (
      <MerchantState
        currentUser={currentUser}
        title="Loading your store workspace"
        description="Checking whether this account already has a seller application."
      />
    );
  }

  if (error && !hasNoStore) {
    return (
      <MerchantState
        currentUser={currentUser}
        title="Could not load your store access"
        description={error.message || 'Something went wrong while checking your seller account.'}
      />
    );
  }

  if (!store) {
    return (
      <>
        <div className="stitch-page stitch-page--desktop">
          <StitchDesktopHeader active="workspace" currentUser={currentUser} />
          <main className="stitch-canvas stitch-canvas--merchant">
            <section className="stitch-section">
              <div className="stitch-section__header">
                <div>
                  <h1>Apply to list your store on DealGrab.</h1>
                  <p>Create your seller profile once, get reviewed, and unlock verified deal publishing.</p>
                </div>
              </div>

              <div className="stitch-merchant-onboarding">
                <StoreApplicationForm
                  mode="apply"
                  initialValues={null}
                  isSubmitting={applyMutation.isPending}
                  errorMessage={applyMutation.isError ? applyMutation.error?.message : ''}
                  successMessage={applyMutation.isSuccess ? applicationFeedback : ''}
                  onSubmit={handleApply}
                />
              </div>
            </section>
          </main>
        </div>

        <div className="stitch-page stitch-page--mobile">
          <StitchMobileHeader currentUser={currentUser} title="Seller access" subtitle="Apply to list your store" />
          <main className="stitch-canvas stitch-canvas--merchant">
            <section className="stitch-section">
              <div className="stitch-section__header">
                <div>
                  <h1>Seller Access</h1>
                  <p>Apply for your verified store profile to unlock moderated deal publishing.</p>
                </div>
              </div>

              <div className="stitch-merchant-onboarding">
                <StoreApplicationForm
                  mode="apply"
                  initialValues={null}
                  isSubmitting={applyMutation.isPending}
                  errorMessage={applyMutation.isError ? applyMutation.error?.message : ''}
                  successMessage={applyMutation.isSuccess ? applicationFeedback : ''}
                  onSubmit={handleApply}
                />
              </div>
            </section>
          </main>
        </div>
      </>
    );
  }

  const rejectedStoreInitialValues = {
    name: store.name,
    address: store.address,
    state: store.stateValue || store.stateLabel,
    city: store.cityValue || store.cityLabel,
    phone: store.phone,
  };

  return (
    <>
      <div className="stitch-page stitch-page--desktop">
        <StitchDesktopHeader active="workspace" currentUser={currentUser} />

        <main className="stitch-canvas stitch-canvas--merchant">
          <div className="stitch-section__header">
            <div>
              <h1>Merchant Overview</h1>
              <p>Here is a summary of your recent store performance.</p>
            </div>
          </div>

          <section className="stitch-merchant-stats">
            <div className="stitch-merchant-stat-card">
              <span>Active Deals</span>
              <strong>{activeDealsSummaryQuery.data?.pagination?.total || 0}</strong>
            </div>
            <div className="stitch-merchant-stat-card">
              <span>Total Views</span>
              <strong>{totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</strong>
            </div>
          </section>

          <section className="stitch-merchant-status-card">
            <div>
              <small>{storeStatus.label}</small>
              <h2>{store.name}</h2>
              <p>{storeStatus.description}</p>
            </div>

            <div className="stitch-chip-row stitch-chip-row--wrap">
              <span className={`stitch-status-pill stitch-status-pill--${store.status === 'approved' ? 'active' : store.status}`}>{storeStatus.label}</span>
              <span className="stitch-status-pill">{store.cityLabel}, {store.stateLabel}</span>
            </div>
          </section>

          {workspaceFeedback ? <p className="stitch-feedback-banner">{workspaceFeedback}</p> : null}

          {store.status === 'rejected' ? (
            <StoreApplicationForm
              mode="resubmit"
              initialValues={rejectedStoreInitialValues}
              isSubmitting={resubmitMutation.isPending}
              errorMessage={resubmitMutation.isError ? resubmitMutation.error?.message : ''}
              successMessage={resubmitMutation.isSuccess ? applicationFeedback : ''}
              onSubmit={handleResubmitStore}
            />
          ) : null}

          {store.status === 'approved' ? (
            <>
              <StoreDealComposer defaultCityLabel={store.cityLabel} />

              <section className="stitch-section">
                <div className="stitch-section__header stitch-section__header--bordered">
                  <div>
                    <h2>Manage Deals</h2>
                    <p>Review, edit, and resubmit your moderated listings.</p>
                  </div>

                  <div className="stitch-chip-row stitch-chip-row--wrap">
                    {ownerDealStatusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`stitch-chip-button${filters.status === option.value ? ' stitch-chip-button--active' : ''}`}
                        onClick={() => {
                          setSearchParams(createStoreDealsSearchParams({ status: option.value, page: 1 }));
                          setEditingDealId(null);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {dealsQuery.isLoading ? (
                  <section className="stitch-state-card">
                    <div className="stitch-state-card__icon">
                      <MaterialIcon name="sell" />
                    </div>
                    <div className="stitch-state-card__copy">
                      <h2>Loading your deals</h2>
                      <p>Fetching your latest moderated listings.</p>
                    </div>
                  </section>
                ) : null}

                {!dealsQuery.isLoading && dealsQuery.error ? (
                  <section className="stitch-state-card stitch-state-card--error">
                    <div className="stitch-state-card__icon">
                      <MaterialIcon name="warning" />
                    </div>
                    <div className="stitch-state-card__copy">
                      <h2>Could not load your deals</h2>
                      <p>{dealsQuery.error.message || 'Please try again in a moment.'}</p>
                    </div>
                  </section>
                ) : null}

                {!dealsQuery.isLoading && !dealsQuery.error && deals.length === 0 ? (
                  <section className="stitch-state-card">
                    <div className="stitch-state-card__icon">
                      <MaterialIcon name="inventory_2" />
                    </div>
                    <div className="stitch-state-card__copy">
                      <h2>No deals in this status</h2>
                      <p>Create a new listing above or switch the status filter to review existing deals.</p>
                    </div>
                  </section>
                ) : null}

                {!dealsQuery.isLoading && !dealsQuery.error && deals.length > 0 ? (
                  <div className="stitch-owner-deals-list">
                    {deals.map((deal) => (
                      <OwnerDealCard
                        key={deal.id}
                        deal={deal}
                        isEditing={editingDealId === deal.id}
                        isArchivePending={activeAction?.type === 'archive' && activeAction?.dealId === deal.id}
                        isResubmitPending={activeAction?.type === 'resubmit' && activeAction?.dealId === deal.id}
                        onToggleEdit={() => {
                          setEditingDealId((currentId) => (currentId === deal.id ? null : deal.id));
                        }}
                        onResubmit={() => {
                          handleResubmitDeal(deal.id);
                        }}
                        onArchive={() => {
                          handleArchiveDeal(deal.id);
                        }}
                        onEditorSuccess={(message) => {
                          setWorkspaceFeedback(message);
                        }}
                      />
                    ))}
                  </div>
                ) : null}

                {pagination.pages > 1 ? (
                  <DealsPagination
                    page={pagination.page}
                    pages={pagination.pages}
                    total={pagination.total}
                    onPageChange={(nextPage) => {
                      setSearchParams(createStoreDealsSearchParams({ status: filters.status, page: nextPage }));
                      setEditingDealId(null);
                    }}
                  />
                ) : null}
              </section>
            </>
          ) : null}

          {store.status !== 'approved' && store.status !== 'rejected' ? (
            <section className="stitch-state-card">
              <div className="stitch-state-card__icon">
                <MaterialIcon name="shield" />
              </div>
              <div className="stitch-state-card__copy">
                <h2>{storeStatus.title}</h2>
                <p>{storeStatus.description}</p>
                <button type="button" className="stitch-pill-button" onClick={() => { refetch(); }}>
                  Refresh Status
                </button>
              </div>
            </section>
          ) : null}
        </main>
      </div>

      <div className="stitch-page stitch-page--mobile">
        <StitchMobileHeader
          currentUser={currentUser}
          title="Seller workspace"
          subtitle={store.name}
        />

        <main className="stitch-canvas stitch-canvas--merchant">
          <div className="stitch-section__header">
            <div>
              <h1>Merchant Overview</h1>
              <p>Here is a summary of your recent store performance.</p>
            </div>
          </div>

          <section className="stitch-merchant-stats">
            <div className="stitch-merchant-stat-card">
              <span>Active Deals</span>
              <strong>{activeDealsSummaryQuery.data?.pagination?.total || 0}</strong>
            </div>
            <div className="stitch-merchant-stat-card">
              <span>Total Views</span>
              <strong>{totalViews > 999 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</strong>
            </div>
          </section>

          <section className="stitch-merchant-status-card">
            <div>
              <small>{storeStatus.label}</small>
              <h2>{store.name}</h2>
              <p>{storeStatus.description}</p>
            </div>

            <div className="stitch-chip-row stitch-chip-row--wrap">
              <span className={`stitch-status-pill stitch-status-pill--${store.status === 'approved' ? 'active' : store.status}`}>{storeStatus.label}</span>
              <span className="stitch-status-pill">{store.cityLabel}, {store.stateLabel}</span>
            </div>
          </section>

          {workspaceFeedback ? <p className="stitch-feedback-banner">{workspaceFeedback}</p> : null}

          {store.status === 'approved' ? <StoreDealComposer defaultCityLabel={store.cityLabel} /> : null}

          {store.status === 'rejected' ? (
            <StoreApplicationForm
              mode="resubmit"
              initialValues={rejectedStoreInitialValues}
              isSubmitting={resubmitMutation.isPending}
              errorMessage={resubmitMutation.isError ? resubmitMutation.error?.message : ''}
              successMessage={resubmitMutation.isSuccess ? applicationFeedback : ''}
              onSubmit={handleResubmitStore}
            />
          ) : null}

          {store.status === 'approved' ? (
            <>
              <div className="stitch-chip-row stitch-chip-row--wrap">
                {ownerDealStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`stitch-chip-button${filters.status === option.value ? ' stitch-chip-button--active' : ''}`}
                    onClick={() => {
                      setSearchParams(createStoreDealsSearchParams({ status: option.value, page: 1 }));
                      setEditingDealId(null);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="stitch-owner-deals-list">
                {dealsQuery.isLoading ? (
                  <section className="stitch-state-card">
                    <div className="stitch-state-card__icon">
                      <MaterialIcon name="sell" />
                    </div>
                    <div className="stitch-state-card__copy">
                      <h2>Loading your deals</h2>
                      <p>Fetching your latest moderated listings.</p>
                    </div>
                  </section>
                ) : null}

                {!dealsQuery.isLoading && dealsQuery.error ? (
                  <section className="stitch-state-card stitch-state-card--error">
                    <div className="stitch-state-card__icon">
                      <MaterialIcon name="warning" />
                    </div>
                    <div className="stitch-state-card__copy">
                      <h2>Could not load your deals</h2>
                      <p>{dealsQuery.error.message || 'Please try again in a moment.'}</p>
                    </div>
                  </section>
                ) : null}

                {!dealsQuery.isLoading && !dealsQuery.error && deals.length === 0 ? (
                  <section className="stitch-state-card">
                    <div className="stitch-state-card__icon">
                      <MaterialIcon name="inventory_2" />
                    </div>
                    <div className="stitch-state-card__copy">
                      <h2>No deals in this status</h2>
                      <p>Create a new listing above or switch the status filter to review existing deals.</p>
                    </div>
                  </section>
                ) : null}

                {!dealsQuery.isLoading && !dealsQuery.error && deals.length > 0 ? (
                  deals.map((deal) => (
                    <OwnerDealCard
                      key={deal.id}
                      deal={deal}
                      isEditing={editingDealId === deal.id}
                      isArchivePending={activeAction?.type === 'archive' && activeAction?.dealId === deal.id}
                      isResubmitPending={activeAction?.type === 'resubmit' && activeAction?.dealId === deal.id}
                      onToggleEdit={() => {
                        setEditingDealId((currentId) => (currentId === deal.id ? null : deal.id));
                      }}
                      onResubmit={() => {
                        handleResubmitDeal(deal.id);
                      }}
                      onArchive={() => {
                        handleArchiveDeal(deal.id);
                      }}
                      onEditorSuccess={(message) => {
                        setWorkspaceFeedback(message);
                      }}
                    />
                  ))
                ) : null}
              </div>
            </>
          ) : null}

          {store.status !== 'approved' && store.status !== 'rejected' ? (
            <section className="stitch-state-card">
              <div className="stitch-state-card__icon">
                <MaterialIcon name="shield" />
              </div>
              <div className="stitch-state-card__copy">
                <h2>{storeStatus.title}</h2>
                <p>{storeStatus.description}</p>
                <button type="button" className="stitch-pill-button" onClick={() => { refetch(); }}>
                  Refresh Status
                </button>
              </div>
            </section>
          ) : null}
        </main>

        <StitchBottomNav active="workspace" currentUser={currentUser} />
      </div>
    </>
  );
}
