import { useEffect, useState } from 'react';
import { AlertCircle, BarChart3, Clock3, Eye, LoaderCircle, PencilLine, RotateCcw } from 'lucide-react';
import { DealsPagination } from '../deals/DealsPagination';
import { StoreDealArchiveControl } from './StoreDealArchiveControl';
import { StoreDealComposer } from './StoreDealComposer';
import { StoreDealEditor } from './StoreDealEditor';
import { StoreOwnedDealMedia } from './StoreOwnedDealMedia';
import { getOwnerDealStatusLabel, normalizeOwnerDealStatus } from './storeDeals.filters';
import { StoreDealsToolbar } from './StoreDealsToolbar';
import { useArchiveOwnedDealMutation, useMyDealsQuery, useResubmitOwnedDealMutation } from './storeDeals.queries';

const actionCopy = {
  resubmit: {
    label: 'Resubmit',
    loading: 'Resubmitting...',
  },
};

export function StoreDealsSection({ defaultCityLabel }) {
  const [feedback, setFeedback] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [editingDealId, setEditingDealId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, refetch, isRefetching, isFetching } = useMyDealsQuery({
    enabled: true,
    limit: 6,
    page: currentPage,
    status: statusFilter,
  });
  const resubmitMutation = useResubmitOwnedDealMutation();
  const archiveMutation = useArchiveOwnedDealMutation();
  const deals = data?.items || [];
  const pagination = data?.pagination || null;
  const totalDeals = pagination?.total || 0;
  const totalPages = Math.max(1, pagination?.pages || 1);
  const resolvedPage = Math.min(Math.max(1, pagination?.page || currentPage), totalPages);

  useEffect(() => {
    if (resolvedPage !== currentPage) {
      setCurrentPage(resolvedPage);
    }
  }, [currentPage, resolvedPage]);

  const handleResubmit = async (dealId) => {
    setActiveAction({ type: 'resubmit', dealId });
    setFeedback('');

    try {
      const result = await resubmitMutation.mutateAsync(dealId);
      setFeedback(result.message);
    } catch (submissionError) {
      setFeedback(submissionError.message || 'Could not resubmit this deal right now.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleArchive = async (dealId) => {
    setActiveAction({ type: 'archive', dealId });
    setFeedback('');

    try {
      const result = await archiveMutation.mutateAsync(dealId);
      setFeedback(result.message);
    } catch (archiveError) {
      setFeedback(archiveError.message || 'Could not archive this deal right now.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleStatusChange = (nextStatus) => {
    const normalizedStatus = normalizeOwnerDealStatus(nextStatus);

    if (normalizedStatus === statusFilter) {
      return;
    }

    setStatusFilter(normalizedStatus);
    setCurrentPage(1);
    setEditingDealId(null);
    setFeedback('');
  };

  const shouldShowPagination = !isLoading && !error && totalDeals > 0 && totalPages > 1;
  const emptyStateTitle =
    statusFilter === 'all' ? 'No seller deals yet' : `No ${getOwnerDealStatusLabel(statusFilter).toLowerCase()} deals`;
  const emptyStateBody =
    statusFilter === 'all'
      ? 'Your first submitted listing will appear here after you create a new deal.'
      : 'Try another status filter or create a new listing to expand your seller workspace.';

  return (
    <section className="store-workspace" aria-label="Your deals">
      <StoreDealComposer defaultCityLabel={defaultCityLabel} />

      <div className="store-workspace__header">
        <div>
          <p className="store-card__eyebrow">Your deals</p>
          <h2>Manage current listings</h2>
          <p>See the latest deal states, keep moderation moving, and clean up expired listings.</p>
        </div>
      </div>

      {feedback ? (
        <p className="store-workspace__feedback" role="status">
          {feedback}
        </p>
      ) : null}

      <StoreDealsToolbar
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        total={totalDeals}
        page={resolvedPage}
        pages={totalPages}
        visibleCount={deals.length}
      />

      {isLoading ? (
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Loading your deals</h2>
            <p>Pulling the latest seller listings from your workspace.</p>
          </div>
        </section>
      ) : null}

      {!isLoading && error ? (
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h2>Could not load your deals</h2>
            <p>{error.message || 'Something went wrong while loading seller listings.'}</p>
            <div className="state-card__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  refetch();
                }}
                disabled={isRefetching}
              >
                {isRefetching ? 'Retrying...' : 'Try again'}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && deals.length === 0 ? (
        <section className="state-card" aria-live="polite">
          <BarChart3 size={18} />
          <div>
            <h2>{emptyStateTitle}</h2>
            <p>{emptyStateBody}</p>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && deals.length > 0 ? (
        <div className="owner-deals-grid">
          {deals.map((deal) => {
            const isResubmitPending =
              activeAction?.type === 'resubmit' && activeAction?.dealId === deal.id;
            const isArchivePending =
              activeAction?.type === 'archive' && activeAction?.dealId === deal.id;
            const canResubmit = deal.status === 'rejected' || deal.status === 'expired';
            const isEditing = editingDealId === deal.id;

            return (
              <article key={deal.id} className="owner-deal-card">
                <StoreOwnedDealMedia
                  title={deal.title}
                  imageUrl={deal.imageUrl}
                  imageCount={deal.imageCount}
                />

                <div className="owner-deal-card__header">
                  <div>
                    <h3>{deal.title}</h3>
                    <p>{deal.description}</p>
                  </div>
                  <span className={`store-status-chip store-status-chip--${deal.statusTone}`}>
                    {deal.statusLabel}
                  </span>
                </div>

                <div className="owner-deal-card__meta">
                  <span>{deal.priceLabel}</span>
                  <span>{deal.cityLabel}</span>
                  <span>Updated {deal.updatedAtLabel}</span>
                  {deal.expiresAtLabel ? <span>Expires {deal.expiresAtLabel}</span> : null}
                </div>

                <div className="owner-deal-card__metrics">
                  <span>
                    <Eye size={14} />
                    {deal.views} views
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {deal.clicks} clicks
                  </span>
                </div>

                <div className="owner-deal-card__actions">
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => {
                      setFeedback('');
                      setEditingDealId((currentDealId) => (currentDealId === deal.id ? null : deal.id));
                    }}
                    disabled={isResubmitPending || isArchivePending}
                  >
                    <PencilLine size={16} />
                    {isEditing ? 'Editing' : 'Edit'}
                  </button>

                  {canResubmit ? (
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => {
                        handleResubmit(deal.id);
                      }}
                      disabled={isResubmitPending || isArchivePending}
                    >
                      <RotateCcw size={16} />
                      {isResubmitPending ? actionCopy.resubmit.loading : actionCopy.resubmit.label}
                    </button>
                  ) : null}

                  <StoreDealArchiveControl
                    isPending={isArchivePending}
                    onConfirm={() => {
                      handleArchive(deal.id);
                    }}
                  />
                </div>

                {isEditing ? (
                  <StoreDealEditor
                    deal={deal}
                    onClose={() => {
                      setEditingDealId(null);
                    }}
                    onSuccess={(message) => {
                      setFeedback(message);
                    }}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}

      {shouldShowPagination ? (
        <DealsPagination
          page={resolvedPage}
          pages={totalPages}
          total={totalDeals}
          onPageChange={(nextPage) => {
            const safePage = Math.min(Math.max(1, nextPage), totalPages);

            if (safePage !== resolvedPage) {
              setCurrentPage(safePage);
              setEditingDealId(null);
              setFeedback('');
            }
          }}
          isDisabled={isFetching}
        />
      ) : null}
    </section>
  );
}
