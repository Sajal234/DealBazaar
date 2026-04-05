import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function normalizeImages(images, imageUrl) {
  const candidates = Array.isArray(images) ? images : [];
  const normalizedImages = candidates.filter((entry) => typeof entry === 'string' && entry.trim());

  if (normalizedImages.length > 0) {
    return normalizedImages;
  }

  if (typeof imageUrl === 'string' && imageUrl.trim()) {
    return [imageUrl];
  }

  return [];
}

export function DealDetailGallery({ title, images, imageUrl }) {
  const galleryImages = useMemo(() => normalizeImages(images, imageUrl), [images, imageUrl]);
  const galleryKey = galleryImages.join('||');
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] || '';
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [galleryKey]);

  if (!activeImage) {
    return (
      <div className="deal-detail__media">
        <div className="deal-detail__gallery-main">
          <div className="deal-detail__image deal-detail__image--placeholder" aria-hidden="true">
            <Search size={20} />
          </div>
        </div>
      </div>
    );
  }

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < galleryImages.length - 1;

  return (
    <div className="deal-detail__media">
      <div className="deal-detail__gallery-main">
        <img
          src={activeImage}
          alt={`${title}${hasMultipleImages ? ` - image ${activeIndex + 1} of ${galleryImages.length}` : ''}`}
          className="deal-detail__image"
        />

        {hasMultipleImages ? (
          <>
            <span className="deal-detail__gallery-count" aria-live="polite">
              {activeIndex + 1} / {galleryImages.length}
            </span>

            <div className="deal-detail__gallery-controls">
              <button
                type="button"
                className="deal-detail__gallery-button"
                onClick={() => {
                  if (canGoPrev) {
                    setActiveIndex(activeIndex - 1);
                  }
                }}
                disabled={!canGoPrev}
                aria-label={`View image ${Math.max(1, activeIndex)} of ${galleryImages.length}`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="deal-detail__gallery-button"
                onClick={() => {
                  if (canGoNext) {
                    setActiveIndex(activeIndex + 1);
                  }
                }}
                disabled={!canGoNext}
                aria-label={`View image ${Math.min(galleryImages.length, activeIndex + 2)} of ${galleryImages.length}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="deal-detail__thumbnails" role="list" aria-label={`${title} image gallery`}>
          {galleryImages.map((galleryImage, index) => (
            <button
              key={`${galleryImage}-${index}`}
              type="button"
              className={`deal-detail__thumbnail${index === activeIndex ? ' deal-detail__thumbnail--active' : ''}`}
              onClick={() => {
                setActiveIndex(index);
              }}
              aria-label={`View image ${index + 1} of ${galleryImages.length}`}
              aria-pressed={index === activeIndex}
            >
              <img src={galleryImage} alt="" className="deal-detail__thumbnail-image" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
