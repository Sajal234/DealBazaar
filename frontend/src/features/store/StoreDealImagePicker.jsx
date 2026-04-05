import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const getFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

export function StoreDealImagePicker({ files, onChange, onError, disabled = false }) {
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = files.map((file) => ({
      key: getFileKey(file),
      name: file.name,
      sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      url: URL.createObjectURL(file),
    }));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((entry) => {
        URL.revokeObjectURL(entry.url);
      });
    };
  }, [files]);

  const selectedCountLabel = useMemo(() => {
    if (files.length === 0) {
      return 'No images selected yet';
    }

    return `${files.length} of ${MAX_IMAGE_COUNT} image${files.length === 1 ? '' : 's'} ready`;
  }, [files]);

  const handleFileSelection = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (incomingFiles.length === 0) {
      return;
    }

    const nextFiles = [...files];
    const existingKeys = new Set(nextFiles.map(getFileKey));

    for (const file of incomingFiles) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        onError('Only JPG, PNG, and WebP images are allowed.');
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        onError('Each image must be 2MB or smaller.');
        return;
      }

      const fileKey = getFileKey(file);

      if (existingKeys.has(fileKey)) {
        continue;
      }

      if (nextFiles.length >= MAX_IMAGE_COUNT) {
        onError('You can upload up to 5 images for one deal.');
        return;
      }

      nextFiles.push(file);
      existingKeys.add(fileKey);
    }

    onError('');
    onChange(nextFiles);
  };

  const handleRemoveFile = (fileKeyToRemove) => {
    onError('');
    onChange(files.filter((file) => getFileKey(file) !== fileKeyToRemove));
  };

  return (
    <div className="store-image-picker">
      <div className="store-file-input">
        <div className="store-file-input__hint">
          <ImagePlus size={16} />
          <span>Upload up to 5 JPG, PNG, or WebP images. Max 2MB each.</span>
        </div>

        <label className={`store-file-input__trigger${disabled ? ' store-file-input__trigger--disabled' : ''}`}>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelection}
            disabled={disabled}
          />
          <span>Add images</span>
        </label>

        <p className="store-file-input__meta">{selectedCountLabel}</p>
      </div>

      {previewUrls.length > 0 ? (
        <div className="store-image-grid" aria-label="Selected deal images">
          {previewUrls.map((preview) => (
            <article key={preview.key} className="store-image-card">
              <div className="store-image-card__media">
                <img src={preview.url} alt={preview.name} />
              </div>

              <div className="store-image-card__body">
                <div>
                  <p className="store-image-card__name">{preview.name}</p>
                  <p className="store-image-card__size">{preview.sizeLabel}</p>
                </div>

                <button
                  type="button"
                  className="store-image-card__remove"
                  onClick={() => {
                    handleRemoveFile(preview.key);
                  }}
                  disabled={disabled}
                  aria-label={`Remove ${preview.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
