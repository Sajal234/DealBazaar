import { MaterialIcon } from './StitchChrome';

export function getStitchInitials(label, fallback = 'DG') {
  if (typeof label !== 'string' || !label.trim()) {
    return fallback;
  }

  const parts = label
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return fallback;
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function StitchAvatar({
  label,
  src = '',
  alt = '',
  size = 'md',
  icon = 'storefront',
  className = '',
}) {
  const classes = `stitch-avatar stitch-avatar--${size}${className ? ` ${className}` : ''}`;

  if (src) {
    return (
      <div className={classes}>
        <img src={src} alt={alt || label || 'Profile'} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={classes} role="img" aria-label={alt || label || 'Profile'}>
      <span className="stitch-avatar__initials">{getStitchInitials(label)}</span>
      <MaterialIcon name={icon} className="stitch-avatar__icon" />
    </div>
  );
}

export function StitchMediaFrame({
  src = '',
  alt = '',
  title,
  subtitle = 'No photo available',
  icon = 'image',
  shape = 'landscape',
  className = '',
}) {
  const classes = `stitch-media-placeholder stitch-media-placeholder--${shape}${className ? ` ${className}` : ''}`;

  if (src) {
    return <img src={src} alt={alt || title || 'Preview'} loading="lazy" />;
  }

  return (
    <div className={classes} role="img" aria-label={alt || subtitle}>
      <div className="stitch-media-placeholder__topline">
        <MaterialIcon name={icon} className="stitch-media-placeholder__icon" />
        <span>{subtitle}</span>
      </div>
      <div className="stitch-media-placeholder__copy">
        <strong>{title || 'DealGrab listing'}</strong>
        <p>Verified local commerce without mock storefront photography.</p>
      </div>
    </div>
  );
}
