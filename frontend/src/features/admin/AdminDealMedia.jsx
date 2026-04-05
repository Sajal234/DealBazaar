import { ImageOff, Images } from 'lucide-react';

function getDealInitial(title) {
  if (typeof title !== 'string' || !title.trim()) {
    return 'D';
  }

  return title.trim().charAt(0).toUpperCase();
}

export function AdminDealMedia({ title, imageUrl, imageCount = 0 }) {
  const hasImage = typeof imageUrl === 'string' && imageUrl.trim().length > 0;

  return (
    <div className="admin-deal-media">
      {hasImage ? (
        <img src={imageUrl} alt={title || 'Deal preview'} loading="lazy" />
      ) : (
        <div className="admin-deal-media__placeholder" aria-hidden="true">
          <span className="admin-deal-media__initial">{getDealInitial(title)}</span>
          <span className="admin-deal-media__label">
            <ImageOff size={14} />
            No image
          </span>
        </div>
      )}

      {imageCount > 1 ? (
        <span className="admin-deal-media__count">
          <Images size={12} />
          {imageCount} images
        </span>
      ) : null}
    </div>
  );
}
