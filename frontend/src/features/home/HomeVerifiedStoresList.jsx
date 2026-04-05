import { ArrowRight, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomeVerifiedStoresList({ stores }) {
  return (
    <div className="home-store-list">
      {stores.map((store) => (
        <article key={store.id} className="home-store-row">
          <div className="home-store-row__copy">
            <Link to={`/stores/${store.id}`} className="home-store-row__name">
              {store.name}
            </Link>

            <div className="home-store-row__meta">
              <span>
                <MapPin size={13} />
                {store.cityLabel}
              </span>
              <span>
                <Star size={13} />
                {store.rating ? `${store.rating} / 5` : 'No ratings yet'}
              </span>
            </div>
          </div>

          <Link to={`/stores/${store.id}`} className="home-store-row__action">
            View
            <ArrowRight size={14} />
          </Link>
        </article>
      ))}
    </div>
  );
}
