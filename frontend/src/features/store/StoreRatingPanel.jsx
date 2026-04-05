import { LoaderCircle, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMyStoreQuery, useStoreRatingMutation } from './store.queries';

export function StoreRatingPanel({ store, currentUser }) {
  const location = useLocation();
  const ratingMutation = useStoreRatingMutation(store.id);
  const hasActiveSession = Boolean(currentUser);
  const { data: ownedStore } = useMyStoreQuery({
    enabled: currentUser?.role === 'store',
  });
  const isOwnStore = currentUser?.role === 'store' && ownedStore?.id === store.id;
  const canRateStore = hasActiveSession && !isOwnStore;

  return (
    <section className="store-rating-panel">
      <div className="store-rating-panel__header">
        <div>
          <p className="detail-store-card__eyebrow">Store rating</p>
          <h3>How was this store experience?</h3>
        </div>
        <div className="store-rating-panel__summary">
          <strong>{store.rating || 'New'}</strong>
          <span>{store.totalRatings} ratings</span>
        </div>
      </div>

      <div className="store-rating-panel__stars" role="group" aria-label="Rate this store from 1 to 5 stars">
        {[1, 2, 3, 4, 5].map((value) => {
          const isActive = Number(store.myRating) >= value;

          return (
            <button
              key={value}
              type="button"
              className={`store-rating-star${isActive ? ' store-rating-star--active' : ''}`}
              onClick={() => {
                if (!canRateStore) {
                  return;
                }

                ratingMutation.mutate(value);
              }}
              disabled={!canRateStore || ratingMutation.isPending}
              aria-label={`Rate this store ${value} star${value > 1 ? 's' : ''}`}
            >
              <Star size={16} />
              <span>{value}</span>
            </button>
          );
        })}
      </div>

      {isOwnStore ? (
        <p className="store-rating-panel__hint">You cannot rate your own store.</p>
      ) : hasActiveSession ? (
        <p className="store-rating-panel__hint">
          {store.myRating
            ? `Your rating: ${store.myRating} / 5`
            : 'Select a rating to share your experience with this store.'}
        </p>
      ) : (
        <p className="store-rating-panel__hint">
          <Link to="/login" state={{ from: location }} className="store-rating-panel__link">
            Sign in
          </Link>{' '}
          to rate this store.
        </p>
      )}

      {ratingMutation.isPending ? (
        <p className="store-rating-panel__status" role="status">
          <LoaderCircle size={14} className="login-form__spinner" />
          Saving your rating...
        </p>
      ) : null}

      {ratingMutation.isSuccess ? (
        <p className="store-rating-panel__status" role="status">
          Your rating has been saved.
        </p>
      ) : null}

      {ratingMutation.isError ? (
        <p className="store-form__error" role="alert">
          {ratingMutation.error?.message || 'Could not save your rating right now.'}
        </p>
      ) : null}
    </section>
  );
}
