import { Clock3, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DealCardMedia } from './DealCardMedia';
import { createDealPreviewEntry } from './deals.preview';

export function DealCard({ deal, previewTimestamp }) {
  return (
    <Link
      to={`/deals/${deal.id}`}
      state={{ dealPreviewEntry: createDealPreviewEntry(deal, previewTimestamp) }}
      className="deal-card"
    >
      <DealCardMedia title={deal.title} imageUrl={deal.imageUrl} priceLabel={deal.priceLabel} />

      <div className="deal-card__body">
        <div className="deal-card__eyebrow">
          <span className="listing-card__badge">Active deal</span>
          {deal.store?.rating ? (
            <span className="deal-card__rating">
              <Star size={14} />
              {deal.store.rating}
            </span>
          ) : null}
        </div>

        <div className="deal-card__headline">
          <h2>{deal.title}</h2>
          <p className="deal-card__price">{deal.priceLabel}</p>
        </div>

        <p className="deal-card__description">{deal.description}</p>

        <div className="deal-card__storeline">
          <div className="deal-card__storecopy">
            <span className="deal-card__store">{deal.store?.name || 'Verified local store'}</span>
            <span className="deal-card__city">
              <MapPin size={13} />
              {deal.cityLabel}
            </span>
          </div>
        </div>

        <div className="deal-card__meta">
          <span>
            <Clock3 size={14} />
            Live offer
          </span>
          <span className="deal-card__meta-link">View details</span>
        </div>
      </div>
    </Link>
  );
}
