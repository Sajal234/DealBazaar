import { ImageIcon, Search } from 'lucide-react';

export function DealCardMedia({ title, imageUrl, imageCount = 0, priceLabel }) {
  const hasMultipleImages = Number(imageCount) > 1;

  if (imageUrl) {
    return (
      <div className="deal-card__image-wrap">
        <img src={imageUrl} alt={title} className="deal-card__image" />
        {hasMultipleImages ? <span className="deal-card__image-count">+{imageCount - 1}</span> : null}
      </div>
    );
  }

  return (
    <div className="deal-card__image-wrap deal-card__image-wrap--placeholder" aria-hidden="true">
      <div className="deal-card__image-stage">
        <div className="deal-card__image-device">
          <ImageIcon size={18} />
        </div>
        <div className="deal-card__image-caption">
          <span className="deal-card__image-price">{priceLabel}</span>
          <span className="deal-card__image-hint">Verified listing</span>
        </div>
      </div>
      <Search size={16} className="deal-card__image-corner" />
    </div>
  );
}
