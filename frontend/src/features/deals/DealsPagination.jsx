import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DealsPagination({ page, pages, total, onPageChange, isDisabled = false }) {
  if (!Number.isFinite(pages) || pages <= 1) {
    return null;
  }

  const isPreviousDisabled = isDisabled || page <= 1;
  const isNextDisabled = isDisabled || page >= pages;

  return (
    <nav className="deals-pagination" aria-label="Deals pagination">
      <button
        type="button"
        className="button button--secondary deals-pagination__button"
        onClick={() => {
          onPageChange(page - 1);
        }}
        disabled={isPreviousDisabled}
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <div className="deals-pagination__summary" aria-live="polite">
        <span>Page {page} of {pages}</span>
        {Number.isFinite(total) ? <span>{total} total deals</span> : null}
      </div>

      <button
        type="button"
        className="button button--secondary deals-pagination__button"
        onClick={() => {
          onPageChange(page + 1);
        }}
        disabled={isNextDisabled}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
