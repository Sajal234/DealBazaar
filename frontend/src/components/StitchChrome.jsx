import { Link } from 'react-router-dom';

export function getAccountPath(currentUser) {
  if (!currentUser) {
    return '/login';
  }

  if (currentUser.role === 'admin') {
    return '/admin';
  }

  if (currentUser.role === 'store') {
    return '/store';
  }

  return '/account';
}

export function getPrimaryWorkspacePath(currentUser) {
  if (!currentUser) {
    return '/login';
  }

  if (currentUser.role === 'admin') {
    return '/admin';
  }

  return '/store';
}

function getNavItemClass(active, value) {
  return `stitch-nav__link${active === value ? ' stitch-nav__link--active' : ''}`;
}

function getBottomNavClass(active, value) {
  return `stitch-bottom-nav__item${active === value ? ' stitch-bottom-nav__item--active' : ''}`;
}

export function MaterialIcon({ name, filled = false, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined${filled ? ' material-symbols-outlined--filled' : ''}${
        className ? ` ${className}` : ''
      }`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function StitchDesktopHeader({
  active = 'browse',
  currentUser = null,
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
}) {
  const accountPath = getAccountPath(currentUser);
  const workspacePath = getPrimaryWorkspacePath(currentUser);
  const workspaceLabel = currentUser?.role === 'admin' ? 'Admin' : currentUser ? 'Dashboard' : 'Sign In';

  return (
    <header className="stitch-header stitch-header--desktop">
      <div className="stitch-header__inner">
        <div className="stitch-header__cluster">
          <Link to="/" className="stitch-brand">
            DealGrab
          </Link>

          <nav className="stitch-nav" aria-label="Primary navigation">
            <Link to="/" className={getNavItemClass(active, 'home')}>
              Home
            </Link>
            <Link to="/deals" className={getNavItemClass(active, 'browse')}>
              Deals
            </Link>
            <Link to="/stores" className={getNavItemClass(active, 'stores')}>
              Stores
            </Link>
            <Link to={workspacePath} className={getNavItemClass(active, 'workspace')}>
              {workspaceLabel}
            </Link>
          </nav>
        </div>

        <div className="stitch-header__actions">
          {showSearch ? (
            <label className="stitch-header__search">
              <MaterialIcon name="search" className="stitch-header__search-icon" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => {
                  onSearchChange?.(event.target.value);
                }}
                placeholder={searchPlaceholder}
              />
            </label>
          ) : null}

          <Link to={accountPath} className="stitch-icon-button" aria-label="Account">
            <MaterialIcon name="account_circle" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StitchMobileHeader({
  currentUser = null,
  backTo = '',
  backLabel = 'Go back',
  title = '',
  subtitle = '',
  trailing,
  children = null,
}) {
  const accountPath = getAccountPath(currentUser);
  const trailingContent =
    trailing === undefined ? (
      <Link to={accountPath} className="stitch-icon-button" aria-label="Account">
        <MaterialIcon name="account_circle" />
      </Link>
    ) : (
      trailing
    );

  return (
    <header className={`stitch-mobile-header${children ? ' stitch-mobile-header--stacked' : ''}`}>
      <div className="stitch-mobile-header__row">
        <div className="stitch-mobile-header__leading">
          {backTo ? (
            <Link to={backTo} className="stitch-icon-button stitch-icon-button--surface" aria-label={backLabel}>
              <MaterialIcon name="arrow_back" />
            </Link>
          ) : (
            <Link to="/" className="stitch-brand stitch-brand--compact">
              DealGrab
            </Link>
          )}

          {title || subtitle ? (
            <div className="stitch-mobile-header__copy">
              {title ? <strong>{title}</strong> : null}
              {subtitle ? <span>{subtitle}</span> : null}
            </div>
          ) : null}
        </div>

        <div className="stitch-mobile-header__actions">{trailingContent}</div>
      </div>

      {children ? <div className="stitch-mobile-header__extra">{children}</div> : null}
    </header>
  );
}

export function StitchBottomNav({ active = 'explore', currentUser = null }) {
  const accountPath = getAccountPath(currentUser);
  const workspacePath = getPrimaryWorkspacePath(currentUser);
  const workspaceLabel = currentUser?.role === 'admin' ? 'Admin' : currentUser ? 'Store' : 'Login';

  return (
    <nav className="stitch-bottom-nav" aria-label="Primary mobile navigation">
      <Link to="/" className={getBottomNavClass(active, 'home')}>
        <MaterialIcon name="home" filled={active === 'home'} className="stitch-bottom-nav__icon" />
        <span>Home</span>
      </Link>

      <Link to="/deals" className={getBottomNavClass(active, 'explore')}>
        <MaterialIcon name="explore" filled={active === 'explore'} className="stitch-bottom-nav__icon" />
        <span>Deals</span>
      </Link>

      <Link to="/stores" className={getBottomNavClass(active, 'stores')}>
        <MaterialIcon name="storefront" filled={active === 'stores'} className="stitch-bottom-nav__icon" />
        <span>Stores</span>
      </Link>

      <Link to={workspacePath} className={getBottomNavClass(active, 'workspace')}>
        <MaterialIcon
          name={currentUser?.role === 'admin' ? 'shield' : 'person'}
          filled={active === 'workspace' || active === 'account'}
          className="stitch-bottom-nav__icon"
        />
        <span>{workspaceLabel}</span>
      </Link>
    </nav>
  );
}
