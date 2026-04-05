import { useEffect, useState } from 'react';
import { LoaderCircle, RotateCcw, Store as StoreIcon } from 'lucide-react';

const emptyForm = {
  name: '',
  address: '',
  state: '',
  city: '',
  phone: '',
};

function normalizePhoneInput(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 10);
}

function createFormState(initialValues = {}) {
  return {
    name: initialValues.name || '',
    address: initialValues.address || '',
    state: initialValues.state || '',
    city: initialValues.city || '',
    phone: normalizePhoneInput(initialValues.phone || ''),
  };
}

export function StoreApplicationForm({
  mode = 'apply',
  initialValues,
  isSubmitting = false,
  errorMessage = '',
  successMessage = '',
  onSubmit,
}) {
  const [form, setForm] = useState(createFormState(initialValues || emptyForm));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(createFormState(initialValues || emptyForm));
    setFormError('');
  }, [initialValues]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedForm = {
      name: form.name.trim(),
      address: form.address.trim(),
      state: form.state.trim(),
      city: form.city.trim(),
      phone: form.phone.trim(),
    };

    if (!normalizedForm.name || !normalizedForm.address || !normalizedForm.state || !normalizedForm.city || !normalizedForm.phone) {
      setFormError('Fill in every store field before submitting your application.');
      return;
    }

    if (normalizedForm.phone.replace(/\D/g, '').length !== 10) {
      setFormError('Enter a valid 10-digit phone number for the store.');
      return;
    }

    setFormError('');
    await onSubmit(normalizedForm);
  };

  const isResubmission = mode === 'resubmit';

  return (
    <article className="store-card store-card--primary">
      <div className="store-card__header">
        <div>
          <p className="store-card__eyebrow">{isResubmission ? 'Resubmit store' : 'Store application'}</p>
          <h2>{isResubmission ? 'Update your store details and resubmit' : 'Tell us about your shop'}</h2>
        </div>
        <StoreIcon size={18} />
      </div>

      <form className="store-form" onSubmit={handleSubmit}>
        <div className="store-form__grid">
          <label className="filter-field">
            <span className="filter-field__label">Store name</span>
            <div className="filter-field__control">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(event) => {
                  setForm((currentForm) => ({ ...currentForm, name: event.target.value }));
                }}
                placeholder="Orbit Digital"
              />
            </div>
          </label>

          <label className="filter-field filter-field--full">
            <span className="filter-field__label">Address</span>
            <div className="filter-field__control">
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={(event) => {
                  setForm((currentForm) => ({ ...currentForm, address: event.target.value }));
                }}
                placeholder="123 Market Road"
              />
            </div>
          </label>

          <label className="filter-field">
            <span className="filter-field__label">State</span>
            <div className="filter-field__control">
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={(event) => {
                  setForm((currentForm) => ({ ...currentForm, state: event.target.value }));
                }}
                placeholder="Karnataka"
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
                placeholder="Bengaluru"
              />
            </div>
          </label>

          <label className="filter-field">
            <span className="filter-field__label">Phone</span>
            <div className="filter-field__control">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(event) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    phone: normalizePhoneInput(event.target.value),
                  }));
                }}
                placeholder="9876543210"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
              />
            </div>
          </label>
        </div>

        {formError ? (
          <p className="store-form__error" role="alert">
            {formError}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="store-form__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="store-form__success" role="status">
            {successMessage}
          </p>
        ) : null}

        <div className="store-card__actions">
          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle size={16} className="login-form__spinner" />
                {isResubmission ? 'Resubmitting...' : 'Submitting...'}
              </>
            ) : (
              <>
                <RotateCcw size={16} />
                {isResubmission ? 'Resubmit for review' : 'Submit for review'}
              </>
            )}
          </button>
        </div>
      </form>
    </article>
  );
}
