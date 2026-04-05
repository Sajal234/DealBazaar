import { Mail, UserRound } from 'lucide-react';

export function AdminStoreOwnerSummary({ ownerName, ownerEmail, ownerId }) {
  return (
    <div className="admin-owner-summary">
      <div className="admin-owner-summary__row">
        <UserRound size={14} />
        <span>{ownerName || 'Owner details unavailable'}</span>
      </div>

      {ownerEmail ? (
        <div className="admin-owner-summary__row">
          <Mail size={14} />
          <span>{ownerEmail}</span>
        </div>
      ) : null}

      {ownerId ? <p className="admin-owner-summary__meta">Owner ID: {ownerId}</p> : null}
    </div>
  );
}
