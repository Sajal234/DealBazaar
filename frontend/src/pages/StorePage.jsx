import { useEffect, useState } from 'react';
import { AlertCircle, BadgeCheck, Clock3, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StoreApplicationForm } from '../features/store/StoreApplicationForm';
import { StoreDealsSection } from '../features/store/StoreDealsSection';
import { useApplyForStoreMutation, useMyStoreQuery, useResubmitStoreMutation } from '../features/store/store.queries';
import '../styles/store.css';

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
    description: 'Review the details below, update what is inaccurate, and send the application back for review.',
  },
};

export function StorePage({ currentUser }) {
  const [applicationFeedback, setApplicationFeedback] = useState('');
  const {
    data: store,
    error,
    isLoading,
    refetch,
    isRefetching,
  } = useMyStoreQuery({ enabled: Boolean(currentUser) && currentUser.role !== 'admin' });
  const applyMutation = useApplyForStoreMutation();
  const resubmitMutation = useResubmitStoreMutation();
  const hasNoStore = error?.status === 404;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (applyMutation.isSuccess) {
      setApplicationFeedback(applyMutation.data?.message || 'Store application submitted successfully.');
    }
  }, [applyMutation.data, applyMutation.isSuccess]);

  useEffect(() => {
    if (resubmitMutation.isSuccess) {
      setApplicationFeedback(resubmitMutation.data?.message || 'Store application updated and resubmitted for review.');
    }
  }, [resubmitMutation.data, resubmitMutation.isSuccess]);

  const handleApply = async (normalizedForm) => {
    setApplicationFeedback('');

    try {
      await applyMutation.mutateAsync(normalizedForm);
    } catch {}
  };

  const handleResubmit = async (normalizedForm) => {
    setApplicationFeedback('');

    try {
      await resubmitMutation.mutateAsync(normalizedForm);
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
    const rejectedStoreInitialValues = {
      name: store.name,
      address: store.address,
      state: store.stateValue || store.stateLabel,
      city: store.cityValue || store.cityLabel,
      phone: store.phone,
    };

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
                <li>Rejected stores can now fix details and resubmit for review.</li>
              </ul>
            </div>
          </aside>
        </section>

        {store.status === 'rejected' ? (
          <StoreApplicationForm
            mode="resubmit"
            initialValues={rejectedStoreInitialValues}
            isSubmitting={resubmitMutation.isPending}
            errorMessage={resubmitMutation.isError ? resubmitMutation.error?.message : ''}
            successMessage={resubmitMutation.isSuccess ? applicationFeedback : ''}
            onSubmit={handleResubmit}
          />
        ) : null}

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
        <StoreApplicationForm
          mode="apply"
          initialValues={null}
          isSubmitting={applyMutation.isPending}
          errorMessage={applyMutation.isError ? applyMutation.error?.message : ''}
          successMessage={applyMutation.isSuccess ? applicationFeedback : ''}
          onSubmit={handleApply}
        />

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
              <span>Moderated onboarding in 48-72 hours</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
