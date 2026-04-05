import { cloneElement, isValidElement, useEffect, useState } from 'react';

const RESET_DELAY_MS = 4000;

export function AdminConfirmActionButton({
  icon,
  label,
  confirmLabel,
  pendingLabel,
  onConfirm,
  className,
  disabled = false,
  isPending = false,
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isConfirming || isPending) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsConfirming(false);
    }, RESET_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isConfirming, isPending]);

  useEffect(() => {
    if (isPending) {
      setIsConfirming(false);
    }
  }, [isPending]);

  const handleClick = () => {
    if (disabled || isPending) {
      return;
    }

    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    onConfirm();
  };

  const resolvedClassName = `${className || ''}${isConfirming ? ' admin-confirm-button--armed' : ''}`.trim();
  const resolvedLabel = isPending ? pendingLabel : isConfirming ? confirmLabel : label;

  return (
    <button
      type="button"
      className={resolvedClassName}
      onClick={handleClick}
      disabled={disabled || isPending}
      aria-live="polite"
    >
      {isValidElement(icon) ? cloneElement(icon, { size: 16 }) : null}
      {resolvedLabel}
    </button>
  );
}
