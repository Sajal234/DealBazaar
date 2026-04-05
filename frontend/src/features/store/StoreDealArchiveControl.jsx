import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export function StoreDealArchiveControl({ isPending, onConfirm }) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    setIsConfirming(false);
  }, [isPending]);

  if (!isConfirming) {
    return (
      <button
        type="button"
        className="button button--ghost owner-deal-card__archive"
        onClick={() => {
          setIsConfirming(true);
        }}
        disabled={isPending}
      >
        <Trash2 size={16} />
        {isPending ? 'Archiving...' : 'Archive'}
      </button>
    );
  }

  return (
    <div className="archive-confirm">
      <p className="archive-confirm__text">
        <AlertTriangle size={14} />
        Archive this deal? It will be removed from shopper-facing views.
      </p>

      <div className="archive-confirm__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            onConfirm();
          }}
          disabled={isPending}
        >
          <Trash2 size={16} />
          {isPending ? 'Archiving...' : 'Yes, archive'}
        </button>

        <button
          type="button"
          className="button button--ghost"
          onClick={() => {
            setIsConfirming(false);
          }}
          disabled={isPending}
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
}
