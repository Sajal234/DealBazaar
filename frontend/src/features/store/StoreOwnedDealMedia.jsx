import { ImageOff, Images } from 'lucide-react';

function getDealInitial(title) {
  if (typeof title !== 'string' || !title.trim()) {
    return 'D';
  }

  return title.trim().charAt(0).toUpperCase();
}

export function StoreOwnedDealMedia({ title, imageUrl, imageCount = 0 }) {
  const hasImage = typeof imageUrl === 'string' && imageUrl.trim().length > 0;

  return (
    <div className="owner-deal-media">
      {hasImage ? (
        <img src={imageUrl} alt={title || 'Deal image'} loading="lazy" />
      ) : (
        <div className="owner-deal-media__placeholder" aria-hidden="true">
          <span className="owner-deal-media__initial">{getDealInitial(title)}</span>
          <span className="owner-deal-media__label">
            <ImageOff size={14} />
            No image
          </span>
        </div>
      )}

      {imageCount > 1 ? (
        <span className="owner-deal-media__count">
          <Images size={12} />
          {imageCount} images
        </span>
      ) : null}
    </div>
  );
}
