import { useEffect, useState } from 'react';
import { AlertCircle, BadgeCheck, Clock3, LoaderCircle, ShieldCheck, Store as StoreIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StoreDealsSection } from '../features/store/StoreDealsSection';
import { useApplyForStoreMutation, useMyStoreQuery } from '../features/store/store.queries';
import '../styles/store.css';

const initialForm = {
  name: '',
  address: '',
  state: '',
  city: '',
  phone: '',
};

const storeStatusCopy = {
  pending: {
    label: 'Pending review',
    title: 'Your store application is under review.',
    description: 'We have your details. An admin will verify the listing before it goes live.',
  },
  approved: {
    label: 'Approved',
    title: 'Your store is live on DealBazaar.',
    description: 'You are ready for the next step: managing live deals and store activity.',
  },
  rejected: {
    label: 'Needs updates',
    title: 'Your store needs changes before approval.',
    description: 'Review the details below and submit an updated application after the required fixes.',
  },
};

export function StorePage({ currentUser }) {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const {
    data: store,
    error,
    isLoading,
    refetch,
    isRefetching,
  } = useMyStoreQuery({ enabled: Boolean(currentUser) && currentUser.role !== 'admin' });
  const applyMutation = useApplyForStoreMutation();
  const hasNoStore = error?.status === 404;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!applyMutation.isSuccess) {
      return;
    }

    setForm(initialForm);
  }, [applyMutation.isSuccess]);

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

    try {
      await applyMutation.mutateAsync(normalizedForm);
    } catch {}
  };

  if (isAdmin) {
    return (
      <main className="page-shell">
        <section className="state-card" aria-live="polite">
          <ShieldCheck size={18} />
          <div>
            <h2>Admin account detected</h2>
            <p>The seller workspace is for store owners. Open the moderation workspace to review pending stores and deals.</p>
            <div className="state-card__actions">
              <Link to="/admin" className="button button--primary">
                Open admin workspace
              </Link>
              <Link to="/deals" className="button button--secondary">
                Browse deals
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="state-card" aria-live="polite">
          <LoaderCircle size={18} className="state-card__spinner" />
          <div>
            <h2>Loading your store workspace</h2>
            <p>Checking whether this account already has a seller application.</p>
          </div>
        </section>
      </main>
    );
  }

  if (error && !hasNoStore) {
    return (
      <main className="page-shell">
        <section className="state-card state-card--error" aria-live="polite">
          <AlertCircle size={18} />
          <div>
            <h2>Could not load your store access</h2>
            <p>{error.message || 'Something went wrong while checking your seller account.'}</p>
            <div className="state-card__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => {
                  refetch();
                }}
                disabled={isRefetching}
              >
                {isRefetching ? 'Retrying...' : 'Try again'}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (store) {
    const statusContent = storeStatusCopy[store.status] || storeStatusCopy.pending;

    return (
      <main className="page-shell store-page">
        <section className="page-header">
          <div>
            <p className="page-header__eyebrow">Seller workspace</p>
            <h1>{store.name}</h1>
            <p>Manage your verified storefront details and keep your local listing ready for shoppers.</p>
          </div>
        </section>

        <section className="store-overview">
          <article className="store-card store-card--primary">
            <div className="store-card__header">
              <div>
                <p className="store-card__eyebrow">Store status</p>
                <h2>{statusContent.title}</h2>
              </div>
              <span className={`store-status-chip store-status-chip--${store.status}`}>{statusContent.label}</span>
            </div>

            <p className="store-card__description">{statusContent.description}</p>

            <dl className="store-facts" aria-label="Store details">
              <div>
                <dt>Location</dt>
                <dd>{store.cityLabel}, {store.stateLabel}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{store.address}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{store.phoneLabel}</dd>
              </div>
              <div>
                <dt>Verification</dt>
                <dd>{store.isVerified ? 'Verified local store' : 'Verification in progress'}</dd>
              </div>
            </dl>

            <div className="store-card__actions">
              <Link to="/deals" className="button button--primary">
                Browse live deals
              </Link>
            </div>
          </article>

          <aside className="store-card store-card--aside">
            <p className="store-card__eyebrow">Account snapshot</p>
            <div className="store-summary-list">
              <div>
                <span>Seller account</span>
                <strong>{currentUser?.name || currentUser?.email}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{currentUser?.role || 'user'}</strong>
              </div>
              <div>
                <span>Rating</span>
                <strong>{store.rating ? `${store.rating} / 5` : 'No ratings yet'}</strong>
              </div>
              <div>
                <span>Total ratings</span>
                <strong>{store.totalRatings}</strong>
              </div>
            </div>

            <div className="store-guidance">
              <p className="store-guidance__title">What happens next</p>
              <ul>
                <li>Approved stores can publish and manage deals.</li>
                <li>Pending stores stay private until moderation is complete.</li>
                <li>Rejected stores will be able to resubmit after fixes.</li>
              </ul>
            </div>
          </aside>
        </section>

        {store.status === 'approved' ? <StoreDealsSection defaultCityLabel={store.cityLabel} /> : null}
      </main>
    );
  }

  return (
    <main className="page-shell store-page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Seller access</p>
          <h1>Apply to list your store on DealBazaar.</h1>
          <p>Create your seller profile once, get reviewed, and unlock verified deal publishing.</p>
        </div>
      </section>

      <section className="store-onboarding">
        <article className="store-card store-card--primary">
          <div className="store-card__header">
            <div>
              <p className="store-card__eyebrow">Store application</p>
              <h2>Tell us about your shop</h2>
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
                      setForm((currentForm) => ({ ...currentForm, phone: event.target.value }));
                    }}
                    placeholder="9876543210"
                    inputMode="numeric"
                  />
                </div>
              </label>
            </div>

            {formError ? (
              <p className="store-form__error" role="alert">
                {formError}
              </p>
            ) : null}

            {applyMutation.isError ? (
              <p className="store-form__error" role="alert">
                {applyMutation.error?.message || 'Could not submit your store application right now.'}
              </p>
            ) : null}

            {applyMutation.isSuccess ? (
              <p className="store-form__success" role="status">
                {applyMutation.data?.message || 'Store application submitted successfully.'}
              </p>
            ) : null}

            <div className="store-card__actions">
              <button type="submit" className="button button--primary" disabled={applyMutation.isPending}>
                {applyMutation.isPending ? 'Submitting...' : 'Submit for review'}
              </button>
            </div>
          </form>
        </article>

        <aside className="store-card store-card--aside">
          <p className="store-card__eyebrow">Verification flow</p>
          <div className="store-guidance">
            <p className="store-guidance__title">How seller approval works</p>
            <ul>
              <li>Submit one verified store profile per account.</li>
              <li>Admins review the store before it appears publicly.</li>
              <li>Approved stores can publish moderated deals next.</li>
            </ul>
          </div>

          <div className="store-checklist">
            <div>
              <BadgeCheck size={16} />
              <span>Real local store identity</span>
            </div>
            <div>
              <ShieldCheck size={16} />
              <span>Approval before public visibility</span>
            </div>
            <div>
              <Clock3 size={16} />
              <span>Moderated onboarding in 48–72 hours</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
