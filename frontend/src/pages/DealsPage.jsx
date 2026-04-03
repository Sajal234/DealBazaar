import { ArrowRight, BadgeCheck, Clock3, MapPin, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const sampleDeals = [
  {
    store: 'Northline Audio',
    title: 'Wireless speaker drop',
    city: 'Bengaluru',
    price: '₹4,990',
    note: 'Verified retailer. Ends tonight.',
  },
  {
    store: 'Studio Roast',
    title: 'Weekend coffee bundle',
    city: 'Mumbai',
    price: '₹799',
    note: 'Fresh stock. Pickup-ready.',
  },
  {
    store: 'Atelier Living',
    title: 'Dining set clearance',
    city: 'Delhi',
    price: '₹18,500',
    note: 'Limited floor inventory.',
  },
];

export function DealsPage() {
  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="page-hero__eyebrow">Verified inventory</p>
          <h1>Browse moderated local offers.</h1>
          <p>
            We’re starting with a clean public browse experience so shoppers can evaluate real
            store inventory before messaging or calling.
          </p>
        </div>

        <div className="page-hero__actions">
          <button type="button" className="button button--secondary">
            <SlidersHorizontal size={18} />
            Filters coming next
          </button>
          <Link to="/login" className="button button--primary">
            Sign in for saved activity
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div className="chip-row" aria-label="Browse suggestions">
        <span className="chip">Today</span>
        <span className="chip">Electronics</span>
        <span className="chip">Home</span>
        <span className="chip">Food</span>
      </div>

      <section className="deal-grid" aria-label="Sample deals">
        {sampleDeals.map((deal) => (
          <article key={deal.title} className="panel-card deal-card">
            <div className="deal-card__topline">
              <span className="inline-badge">
                <BadgeCheck size={14} />
                Verified store
              </span>
              <span className="deal-card__price">{deal.price}</span>
            </div>
            <h2>{deal.title}</h2>
            <p className="deal-card__store">{deal.store}</p>
            <div className="deal-card__meta">
              <span>
                <MapPin size={14} />
                {deal.city}
              </span>
              <span>
                <Clock3 size={14} />
                Limited time
              </span>
            </div>
            <p className="deal-card__note">{deal.note}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
