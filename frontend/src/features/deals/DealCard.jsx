import { Clock3, MapPin, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createDealPreviewEntry } from './deals.preview';

export function DealCard({ deal, previewTimestamp }) {
  return (
    <Link
      to={`/deals/${deal.id}`}
      state={{ dealPreviewEntry: createDealPreviewEntry(deal, previewTimestamp) }}
      className="deal-card"
    >
      <div className="deal-card__image-wrap">
        {deal.imageUrl ? (
          <img src={deal.imageUrl} alt={deal.title} className="deal-card__image" />
        ) : (
          <div className="deal-card__image deal-card__image--placeholder" aria-hidden="true">
            <Search size={18} />
          </div>
        )}
      </div>

      <div className="deal-card__body">
        <div className="deal-card__topline">
          <span className="listing-card__badge">Active deal</span>
          <span className="deal-card__price">{deal.priceLabel}</span>
        </div>

        <h2>{deal.title}</h2>
        <p className="deal-card__description">{deal.description}</p>

        {deal.store ? (
          <div className="deal-card__storeline">
            <span className="deal-card__store">{deal.store.name}</span>
            {deal.store.rating ? (
              <span className="deal-card__rating">
                <Star size={14} />
                {deal.store.rating}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="deal-card__meta">
          <span>
            <MapPin size={14} />
            {deal.cityLabel}
          </span>
          <span>
            <Clock3 size={14} />
            Live offer
          </span>
        </div>

        <span className="deal-card__cta">View details</span>
      </div>
    </Link>
  );
}
