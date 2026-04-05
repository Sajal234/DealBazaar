import { BadgeCheck, MapPin, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PublicStoreCard({ store }) {
  return (
    <article className="public-store-card">
      <div className="public-store-card__header">
        <div>
          <p className="public-store-card__eyebrow">Verified store</p>
          <h2>{store.name}</h2>
        </div>
        {store.isVerified ? (
          <span className="public-store-card__badge">
            <BadgeCheck size={14} />
            Verified
          </span>
        ) : null}
      </div>

      <p className="public-store-card__address">{store.address}</p>

      <div className="public-store-card__meta">
        <span>
          <MapPin size={14} />
          {store.cityLabel}, {store.stateLabel}
        </span>
        <span>
          <Phone size={14} />
          {store.phoneLabel}
        </span>
        <span>
          <Star size={14} />
          {store.rating ? `${store.rating} / 5` : 'No ratings yet'}
        </span>
      </div>

      <div className="public-store-card__actions">
        <Link to={`/stores/${store.id}`} className="button button--primary">
          View store
        </Link>
        <Link to={`/deals?city=${encodeURIComponent(store.cityValue || store.cityLabel)}`} className="button button--secondary">
          Browse local deals
        </Link>
      </div>
    </article>
  );
}
