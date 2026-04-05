import { BadgeCheck, LogIn, Mail, ShieldCheck, Store as StoreIcon, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountPasswordForm } from '../features/auth/AccountPasswordForm';
import '../styles/account.css';

const roleContent = {
  admin: {
    label: 'Administrator',
    title: 'You have moderation access.',
    description: 'Review pending stores and deals, and keep marketplace quality high.',
    primaryAction: {
      href: '/admin',
      label: 'Open admin workspace',
    },
  },
  store: {
    label: 'Verified seller',
    title: 'You can manage your storefront and listings.',
    description: 'Access store tools, manage current deals, and publish new local offers.',
    primaryAction: {
      href: '/store',
      label: 'Open seller workspace',
    },
  },
  user: {
    label: 'Marketplace shopper',
    title: 'Your account is ready for browsing and rating.',
    description: 'Explore verified deals, rate stores, and upgrade to a seller workflow when needed.',
    primaryAction: {
      href: '/deals',
      label: 'Browse verified deals',
    },
  },
};

export function AccountPage({ currentUser }) {
  const roleKey = currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'store' ? 'store' : 'user';
  const roleInfo = roleContent[roleKey];

  return (
    <main className="page-shell account-page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Account</p>
          <h1>Your DealBazaar profile</h1>
          <p>Keep track of the account you are using, your marketplace access level, and the next action available to you.</p>
        </div>
      </section>

      <div className="account-layout">
        <section className="account-card account-card--primary">
          <div className="account-card__header">
            <div>
              <p className="account-card__eyebrow">Profile</p>
              <h2>{currentUser?.name || 'DealBazaar member'}</h2>
            </div>
            <span className="account-role-chip">{roleInfo.label}</span>
          </div>

          <div className="account-facts" aria-label="Account details">
            <div>
              <span className="account-facts__label">
                <UserRound size={16} />
                Name
              </span>
              <strong>{currentUser?.name || 'Not provided'}</strong>
            </div>
            <div>
              <span className="account-facts__label">
                <Mail size={16} />
                Email
              </span>
              <strong>{currentUser?.email || 'Not available'}</strong>
            </div>
            <div>
              <span className="account-facts__label">
                <ShieldCheck size={16} />
                Role
              </span>
              <strong>{roleInfo.label}</strong>
            </div>
            <div>
              <span className="account-facts__label">
                <BadgeCheck size={16} />
                Session
              </span>
              <strong>Signed in</strong>
            </div>
          </div>
        </section>

        <aside className="account-card account-card--aside">
          <p className="account-card__eyebrow">Access level</p>
          <h2>{roleInfo.title}</h2>
          <p className="account-card__description">{roleInfo.description}</p>

          <div className="account-card__actions">
            <Link to={roleInfo.primaryAction.href} className="button button--primary">
              {roleInfo.primaryAction.label}
            </Link>
            <Link to="/deals" className="button button--secondary">
              View live deals
            </Link>
          </div>
        </aside>
      </div>

      <section className="account-grid" aria-label="Next actions">
        <article className="account-card">
          <div className="account-card__icon">
            <LogIn size={18} />
          </div>
          <div>
            <p className="account-card__eyebrow">Marketplace</p>
            <h3>Stay active as a shopper</h3>
            <p className="account-card__description">
              Browse verified local offers, compare listings, and open deal details for contact actions.
            </p>
          </div>
          <Link to="/deals" className="account-inline-link">
            Go to deals
          </Link>
        </article>

        <article className="account-card">
          <div className="account-card__icon">
            <StoreIcon size={18} />
          </div>
          <div>
            <p className="account-card__eyebrow">Seller tools</p>
            <h3>{roleKey === 'store' ? 'Manage your storefront' : 'Apply to become a seller'}</h3>
            <p className="account-card__description">
              {roleKey === 'store'
                ? 'Open your store workspace to publish, update, and monitor current listings.'
                : 'Create a store profile when you want verified local seller access.'}
            </p>
          </div>
          <Link to="/store" className="account-inline-link">
            {roleKey === 'store' ? 'Open store workspace' : 'Explore seller access'}
          </Link>
        </article>

        {roleKey === 'admin' ? (
          <article className="account-card">
            <div className="account-card__icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="account-card__eyebrow">Moderation</p>
              <h3>Keep the marketplace verified</h3>
              <p className="account-card__description">
                Review pending stores and deals from one queue and apply approvals or rejections quickly.
              </p>
            </div>
            <Link to="/admin" className="account-inline-link">
              Open moderation queue
            </Link>
          </article>
        ) : null}
      </section>

      <AccountPasswordForm />
    </main>
  );
}
