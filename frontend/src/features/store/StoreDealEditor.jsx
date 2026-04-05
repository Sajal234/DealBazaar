import { useEffect, useState } from 'react';
import { LoaderCircle, PencilLine, X } from 'lucide-react';
import { useUpdateOwnedDealMutation } from './storeDeals.queries';

function createInitialForm(deal) {
  return {
    productName: deal?.title || '',
    description: deal?.description || '',
    price: deal?.priceValue ?? '',
    city: deal?.cityValue || '',
  };
}

export function StoreDealEditor({ deal, onClose, onSuccess }) {
  const [form, setForm] = useState(createInitialForm(deal));
  const [error, setError] = useState('');
  const updateMutation = useUpdateOwnedDealMutation();

  useEffect(() => {
    setForm(createInitialForm(deal));
    setError('');
  }, [deal]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedForm = {
      productName: form.productName.trim(),
      description: form.description.trim(),
      price: String(form.price).trim(),
      city: form.city.trim(),
    };

    if (!normalizedForm.productName || !normalizedForm.description || !normalizedForm.price) {
      setError('Product name, description, and price are required.');
      return;
    }

    if (Number.isNaN(Number(normalizedForm.price)) || Number(normalizedForm.price) < 0) {
      setError('Enter a valid price greater than or equal to 0.');
      return;
    }

    setError('');

    try {
      const result = await updateMutation.mutateAsync({
        dealId: deal.id,
        updates: normalizedForm,
      });

      onSuccess(result.message);
      onClose();
    } catch (submissionError) {
      setError(submissionError.message || 'Could not update this deal right now.');
    }
  };

  return (
    <form className="store-deal-editor" onSubmit={handleSubmit}>
      <div className="store-deal-editor__header">
        <div>
          <p className="store-card__eyebrow">Edit deal</p>
          <h4>Update listing details</h4>
        </div>

        <button type="button" className="button button--ghost" onClick={onClose} disabled={updateMutation.isPending}>
          <X size={16} />
          Close
        </button>
      </div>

      <div className="store-form__grid">
        <label className="filter-field filter-field--full">
          <span className="filter-field__label">Product name</span>
          <div className="filter-field__control">
            <input
              type="text"
              value={form.productName}
              onChange={(event) => {
                setForm((currentForm) => ({ ...currentForm, productName: event.target.value }));
              }}
              placeholder="Weekend flagship price drop"
            />
          </div>
        </label>

        <label className="filter-field filter-field--full">
          <span className="filter-field__label">Description</span>
          <div className="filter-field__control filter-field__control--textarea">
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => {
                setForm((currentForm) => ({ ...currentForm, description: event.target.value }));
              }}
              placeholder="Describe the offer, pickup details, and what changed."
            />
          </div>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">Price</span>
          <div className="filter-field__control">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => {
                setForm((currentForm) => ({ ...currentForm, price: event.target.value }));
              }}
              placeholder="18999"
            />
          </div>
        </label>

        <label className="filter-field">
          <span className="filter-field__label">City</span>
          <div className="filter-field__control">
            <input
              type="text"
              value={form.city}
              onChange={(event) => {
                setForm((currentForm) => ({ ...currentForm, city: event.target.value }));
              }}
              placeholder="Bengaluru"
            />
          </div>
        </label>
      </div>

      {error ? (
        <p className="store-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="store-card__actions">
        <button type="submit" className="button button--primary" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <LoaderCircle size={16} className="login-form__spinner" />
              Saving...
            </>
          ) : (
            <>
              <PencilLine size={16} />
              Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
