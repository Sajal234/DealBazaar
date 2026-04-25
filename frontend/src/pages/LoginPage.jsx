import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthButton } from '../features/auth/GoogleAuthButton';
import { loginUser, loginWithGoogle } from '../features/auth/auth.api';
import { getPostAuthPath } from '../features/auth/auth.redirects';
import { clearAuthSession, persistAuthSession } from '../features/auth/auth.session';
import { MaterialIcon } from '../components/StitchChrome';

const authMetrics = [
  { value: 'Verified', label: 'Store review flow' },
  { value: 'Live', label: 'Moderated deals' },
  { value: 'Direct', label: 'Local store contact' },
];

const authHighlights = [
  'Browse approved local deals without generic marketplace clutter.',
  'Manage your store listings and moderation updates from one place.',
  'Keep trust signals, expiry details, and seller workflows visible.',
];

function AuthSessionNote({ hasSavedSession, isAuthLoading, onClearSession }) {
  if (!hasSavedSession) {
    return null;
  }

  return (
    <div className="stitch-auth__note">
      <p>{isAuthLoading ? 'Checking your saved session...' : 'A saved session was found on this browser.'}</p>
      <button type="button" className="stitch-inline-link" onClick={onClearSession}>
        Sign out here
      </button>
    </div>
  );
}

function AuthError({ error }) {
  if (!error) {
    return null;
  }

  return (
    <div className="stitch-auth__error" role="alert">
      <MaterialIcon name="error" className="stitch-auth__error-icon" />
      <p>{error}</p>
    </div>
  );
}

function DesktopAuthVisual() {
  return (
    <aside className="stitch-auth__visual stitch-auth__visual--branded">
      <div className="stitch-auth__visual-shell">
        <span className="stitch-auth__visual-badge">DealGrab access</span>
        <h3>Verified local deals, real stores, and a cleaner workflow.</h3>
        <p>
          Sign in to browse faster, manage seller operations, and stay aligned with live moderation updates.
        </p>

        <div className="stitch-auth__visual-metrics">
          {authMetrics.map((item) => (
            <article key={item.label} className="stitch-auth__visual-metric">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>

        <ul className="stitch-auth__visual-list">
          {authHighlights.map((item) => (
            <li key={item}>
              <MaterialIcon name="check" filled className="stitch-auth__visual-list-icon" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function LoginPage({ currentUser, hasSavedSession, isAuthLoading }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestedLocation = location.state?.from;

  if (currentUser) {
    return <Navigate to={getPostAuthPath(currentUser, requestedLocation)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const session = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      persistAuthSession(session);
      navigate(getPostAuthPath(session, requestedLocation), { replace: true });
    } catch (submissionError) {
      setError(submissionError.message || 'Could not sign you in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSession = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const handleGoogleCredential = async (credential) => {
    setIsSubmitting(true);
    setError('');

    try {
      const session = await loginWithGoogle({ credential });

      persistAuthSession(session);
      navigate(getPostAuthPath(session, requestedLocation), { replace: true });
    } catch (submissionError) {
      setError(submissionError.message || 'Could not sign you in with Google right now.');
      throw submissionError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="stitch-page stitch-page--desktop">
        <main className="stitch-auth stitch-auth--desktop">
          <section className="stitch-auth__panel">
            <header className="stitch-auth__brand">
              <h1>DealGrab</h1>
            </header>

            <section className="stitch-auth__form-wrap">
              <h2>Welcome back</h2>
              <p>Access your verified local deals, seller workspace, and trust-first marketplace tools.</p>

              <form className="stitch-auth__form" onSubmit={handleSubmit}>
                <AuthSessionNote
                  hasSavedSession={hasSavedSession}
                  isAuthLoading={isAuthLoading}
                  onClearSession={handleClearSession}
                />

                <label className="stitch-auth__field">
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => {
                      setForm((currentForm) => ({ ...currentForm, email: event.target.value }));
                    }}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </label>

                <label className="stitch-auth__field">
                  <div className="stitch-auth__field-header">
                    <span>Password</span>
                    <Link to="/forgot-password" className="stitch-inline-link">
                      Forgot?
                    </Link>
                  </div>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => {
                      setForm((currentForm) => ({ ...currentForm, password: event.target.value }));
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={error ? 'stitch-auth__field-input--error' : ''}
                  />
                </label>

                <AuthError error={error} />

                <div className="stitch-auth__submit-row">
                  <button type="submit" className="stitch-action-button stitch-action-button--primary stitch-action-button--full" disabled={isSubmitting}>
                    <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                  </button>
                </div>

                <div className="stitch-auth__divider">
                  <span>Or</span>
                </div>

                <Link to="/deals" className="stitch-action-button stitch-action-button--secondary stitch-action-button--full">
                  Continue as Guest
                </Link>

                <GoogleAuthButton
                  label="Continue with Google"
                  disabled={isSubmitting}
                  onCredential={handleGoogleCredential}
                  onError={(googleError) => {
                    setError(googleError.message || 'Could not sign you in with Google right now.');
                  }}
                />
              </form>

              <div className="stitch-auth__footer-link">
                <p>
                  New to DealGrab?{' '}
                  <Link to="/signup" state={{ from: requestedLocation }}>
                    Create an account
                  </Link>
                </p>
              </div>
            </section>
          </section>

          <DesktopAuthVisual />
        </main>
      </div>

      <div className="stitch-page stitch-page--mobile">
        <main className="stitch-auth stitch-auth--mobile">
          <div className="stitch-auth__ambient stitch-auth__ambient--left" />
          <div className="stitch-auth__ambient stitch-auth__ambient--right" />

          <div className="stitch-auth__mobile-wrap">
            <header className="stitch-auth__mobile-brand">
              <h1>DealGrab</h1>
              <p>Verified local deals. Real stores. No clutter.</p>
            </header>

            <div className="stitch-auth__mobile-card">
              <form className="stitch-auth__form" onSubmit={handleSubmit}>
                <AuthSessionNote
                  hasSavedSession={hasSavedSession}
                  isAuthLoading={isAuthLoading}
                  onClearSession={handleClearSession}
                />

                <label className="stitch-auth__field">
                  <span>Email Address</span>
                  <div className="stitch-auth__input-wrap">
                    <MaterialIcon name="mail" className="stitch-auth__input-icon" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => {
                        setForm((currentForm) => ({ ...currentForm, email: event.target.value }));
                      }}
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                  </div>
                </label>

                <label className="stitch-auth__field">
                  <div className="stitch-auth__field-header">
                    <span>Password</span>
                    <Link to="/forgot-password" className="stitch-inline-link">
                      Forgot?
                    </Link>
                  </div>

                  <div className="stitch-auth__input-wrap">
                    <MaterialIcon name="lock" className="stitch-auth__input-icon" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => {
                        setForm((currentForm) => ({ ...currentForm, password: event.target.value }));
                      }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                <AuthError error={error} />

                <button type="submit" className="stitch-action-button stitch-action-button--primary stitch-action-button--full" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                  <MaterialIcon name="arrow_forward" className="stitch-auth__submit-icon" />
                </button>

                <Link to="/deals" className="stitch-action-button stitch-action-button--secondary stitch-action-button--full">
                  Continue as Guest
                </Link>
              </form>

              <div className="stitch-auth__divider stitch-auth__divider--mobile">
                <span>Or continue with</span>
              </div>

              <GoogleAuthButton
                label="Continue with Google"
                disabled={isSubmitting}
                onCredential={handleGoogleCredential}
                onError={(googleError) => {
                  setError(googleError.message || 'Could not sign you in with Google right now.');
                }}
              />
            </div>

            <div className="stitch-auth__footer-link stitch-auth__footer-link--mobile">
              <p>
                New to DealGrab?{' '}
                <Link to="/signup" state={{ from: requestedLocation }}>
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
