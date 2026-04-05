import { useState } from 'react';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { StoreDealImagePicker } from './StoreDealImagePicker';
import { useCreateOwnedDealMutation } from './storeDeals.queries';

const initialForm = {
  productName: '',
  description: '',
  price: '',
  city: '',
};

export function StoreDealComposer({ defaultCityLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const createDealMutation = useCreateOwnedDealMutation();

  const handleReset = () => {
    setForm(initialForm);
    setFiles([]);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedForm = {
      productName: form.productName.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
      city: form.city.trim(),
    };

    if (!normalizedForm.productName || !normalizedForm.description || !normalizedForm.price) {
      setError('Add a product name, description, and price before submitting a deal.');
      return;
    }

    if (Number.isNaN(Number(normalizedForm.price)) || Number(normalizedForm.price) < 0) {
      setError('Enter a valid price greater than or equal to 0.');
      return;
    }

    setError('');
    setFeedback('');

    try {
      const result = await createDealMutation.mutateAsync({
        ...normalizedForm,
        images: files,
      });

      setFeedback(result.message);
      handleReset();
      setIsOpen(false);
    } catch (submissionError) {
      setError(submissionError.message || 'Could not submit the deal right now.');
    }
  };

  return (
    <section className="store-composer">
      <div className="store-composer__header">
        <div>
          <p className="store-card__eyebrow">New deal</p>
          <h2>Create a moderated listing</h2>
          <p>Publish a new offer for review. Approved stores can submit deals that go live after moderation.</p>
        </div>

        <button
          type="button"
          className={`button ${isOpen ? 'button--secondary' : 'button--primary'}`}
          onClick={() => {
            setIsOpen((currentValue) => !currentValue);
            setError('');
            setFeedback('');
          }}
        >
          {isOpen ? <X size={16} /> : <Plus size={16} />}
          {isOpen ? 'Close composer' : 'New deal'}
        </button>
      </div>

      {feedback ? (
        <p className="store-workspace__feedback" role="status">
          {feedback}
        </p>
      ) : null}

      {isOpen ? (
        <form className="store-deal-form" onSubmit={handleSubmit}>
          <div className="store-form__grid">
            <label className="filter-field filter-field--full">
              <span className="filter-field__label">Product name</span>
              <div className="filter-field__control">
                <input
                  type="text"
                  name="productName"
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
                  name="description"
                  value={form.description}
                  onChange={(event) => {
                    setForm((currentForm) => ({ ...currentForm, description: event.target.value }));
                  }}
                  placeholder="Share the product details, pickup terms, and what makes this offer worth noticing."
                  rows={5}
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
                  name="price"
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
                  name="city"
                  value={form.city}
                  onChange={(event) => {
                    setForm((currentForm) => ({ ...currentForm, city: event.target.value }));
                  }}
                  placeholder={defaultCityLabel || 'Defaults to your store city'}
                />
              </div>
            </label>

            <label className="filter-field filter-field--full">
              <span className="filter-field__label">Images</span>
              <StoreDealImagePicker
                files={files}
                onChange={setFiles}
                onError={setError}
                disabled={createDealMutation.isPending}
              />
            </label>
          </div>

          {error ? (
            <p className="store-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="store-card__actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={createDealMutation.isPending}
            >
              {createDealMutation.isPending ? (
                <>
                  <LoaderCircle size={16} className="login-form__spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Submit deal
                </>
              )}
            </button>

            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                handleReset();
              }}
              disabled={createDealMutation.isPending}
            >
              Reset
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
