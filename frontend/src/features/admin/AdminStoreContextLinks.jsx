import { ExternalLink, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminStoreContextLinks({ storeId = '', phone = '', viewLabel = 'View store page' }) {
  const hasStoreLink = typeof storeId === 'string' && storeId.trim().length > 0;
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const hasPhone = normalizedPhone.length > 0;

  if (!hasStoreLink && !hasPhone) {
    return null;
  }

  return (
    <div className="admin-context-links">
      {hasStoreLink ? (
        <Link to={`/stores/${storeId}`} className="admin-context-links__item">
          <ExternalLink size={14} />
          {viewLabel}
        </Link>
      ) : null}

      {hasPhone ? (
        <a href={`tel:${normalizedPhone}`} className="admin-context-links__item">
          <Phone size={14} />
          Call store
        </a>
      ) : null}
    </div>
  );
}
