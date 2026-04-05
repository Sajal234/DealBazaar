import { useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Clock3, Eye, LoaderCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useArchiveOwnedDealMutation, useMyDealsQuery, useResubmitOwnedDealMutation } from './storeDeals.queries';

const actionCopy = {
  resubmit: {
    label: 'Resubmit',
    loading: 'Resubmitting...',
  },
  archive: {
    label: 'Archive',
    loading: 'Archiving...',
  },
};

export function StoreDealsSection() {
  const [feedback, setFeedback] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const { data, isLoading, error, refetch, isRefetching } = useMyDealsQuery({ enabled: true, limit: 6, page: 1 });
  const resubmitMutation = useResubmitOwnedDealMutation();
  const archiveMutation = useArchiveOwnedDealMutation();
  const deals = data?.items || [];
  const totalDeals = data?.pagination?.total || deals.length;

  const metrics = useMemo(() => {
    return deals.reduce(
      (summary, deal) => {
        summary.views += deal.views;
        summary.clicks += deal.clicks;
        return summary;
      },
      { views: 0, clicks: 0 }
    );
  }, [deals]);

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

  return (
    <section className="store-workspace" aria-label="Your deals">
      <div className="store-workspace__header">
        <div>
          <p className="store-card__eyebrow">Your deals</p>
          <h2>Manage current listings</h2>
          <p>See the latest deal states, keep moderation moving, and clean up expired listings.</p>
        </div>

        <div className="store-workspace__stats">
          <div>
            <span>Latest listings</span>
            <strong>{totalDeals}</strong>
          </div>
          <div>
            <span>Total views</span>
            <strong>{metrics.views}</strong>
          </div>
          <div>
            <span>Total clicks</span>
            <strong>{metrics.clicks}</strong>
          </div>
        </div>
      </div>

      {feedback ? (
        <p className="store-workspace__feedback" role="status">
          {feedback}
        </p>
      ) : null}

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
            <h2>No seller deals yet</h2>
            <p>Your latest deals will show up here as soon as deal publishing is added in the next step.</p>
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

            return (
              <article key={deal.id} className="owner-deal-card">
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

                  <button
                    type="button"
                    className="button button--ghost owner-deal-card__archive"
                    onClick={() => {
                      handleArchive(deal.id);
                    }}
                    disabled={isArchivePending || isResubmitPending}
                  >
                    <Trash2 size={16} />
                    {isArchivePending ? actionCopy.archive.loading : actionCopy.archive.label}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
