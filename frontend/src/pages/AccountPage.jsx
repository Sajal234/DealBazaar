import { BadgeCheck, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { adminKeys } from '../features/admin/admin.queries';
import { authKeys } from '../features/auth/auth.queries';
import { clearAuthSession } from '../features/auth/auth.session';
import { storeKeys } from '../features/store/store.queries';
import { storeDealsKeys } from '../features/store/storeDeals.queries';
import { AccountPasswordForm } from '../features/auth/AccountPasswordForm';
import '../styles/account.css';

const roleContent = {
  admin: {
    label: 'Administrator',
    title: 'Moderation access is active.',
    description: 'Review pending stores and deals from one place.',
    primaryAction: {
      href: '/admin',
      label: 'Open admin workspace',
    },
  },
  store: {
    label: 'Verified seller',
    title: 'Your seller tools are ready.',
    description: 'Manage your storefront, current deals, and new submissions.',
    primaryAction: {
      href: '/store',
      label: 'Open my store',
    },
  },
  user: {
    label: 'Marketplace shopper',
    title: 'Your account is ready to browse.',
    description: 'Explore deals, rate stores, and apply for seller access when needed.',
    primaryAction: {
      href: '/deals',
      label: 'Browse verified deals',
    },
  },
};

function getAccountBadgeText(user) {
  const source = typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : user?.email || '';

  if (!source) {
    return 'DG';
  }

  const parts = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase() || 'DG';
}

export function AccountPage({ currentUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roleKey = currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'store' ? 'store' : 'user';
  const roleInfo = roleContent[roleKey];
  const showDealsShortcut = roleInfo.primaryAction.href !== '/deals';

  const handleSignOut = () => {
    clearAuthSession();
    queryClient.removeQueries({ queryKey: authKeys.all });
    queryClient.removeQueries({ queryKey: storeKeys.all });
    queryClient.removeQueries({ queryKey: storeDealsKeys.all });
    queryClient.removeQueries({ queryKey: adminKeys.all });
    navigate('/', { replace: true });
  };

  return (
    <main className="page-shell account-page">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Account</p>
          <h1>Your DealGrab account</h1>
          <p>View your account details, access level, and the one place you should go next.</p>
        </div>
      </section>

      <div className="account-layout">
        <section className="account-card account-card--primary">
          <div className="account-card__header">
            <div className="account-summary">
              <div className="account-summary__badge" aria-hidden="true">
                {getAccountBadgeText(currentUser)}
              </div>
              <div>
                <p className="account-card__eyebrow">Profile</p>
                <h2>{currentUser?.name || 'DealGrab member'}</h2>
                <p className="account-card__description">{currentUser?.email || 'Not available'}</p>
              </div>
            </div>
            <span className="account-role-chip">{roleInfo.label}</span>
          </div>

          <div className="account-status">
            <p className="account-card__eyebrow">Access level</p>
            <h3>{roleInfo.title}</h3>
          </div>
          <p className="account-card__description">{roleInfo.description}</p>

          <div className="account-card__actions">
            <Link to={roleInfo.primaryAction.href} className="button button--primary">
              {roleInfo.primaryAction.label}
            </Link>
            {showDealsShortcut ? (
              <Link to="/deals" className="button button--secondary">
                View live deals
              </Link>
            ) : null}
            <button type="button" className="button button--ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </section>

        <aside className="account-card account-card--details" aria-label="Account details">
          <p className="account-card__eyebrow">Details</p>
          <div className="account-detail-list">
            <div className="account-detail-row">
              <span className="account-detail-row__label">
                <UserRound size={16} />
                Name
              </span>
              <strong>{currentUser?.name || 'Not provided'}</strong>
            </div>
            <div className="account-detail-row">
              <span className="account-detail-row__label">
                <Mail size={16} />
                Email
              </span>
              <strong>{currentUser?.email || 'Not available'}</strong>
            </div>
            <div className="account-detail-row">
              <span className="account-detail-row__label">
                <ShieldCheck size={16} />
                Role
              </span>
              <strong>{roleInfo.label}</strong>
            </div>
            <div className="account-detail-row">
              <span className="account-detail-row__label">
                <BadgeCheck size={16} />
                Session
              </span>
              <strong>Signed in</strong>
            </div>
          </div>
        </aside>
      </div>

      <AccountPasswordForm />
    </main>
  );
}
