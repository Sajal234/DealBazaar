import { useState } from 'react';
import { ArrowRight, KeyRound, LoaderCircle, Mail } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../features/auth/auth.api';
import { clearAuthSession, persistAuthSession } from '../features/auth/auth.session';
import '../styles/login.css';

export function LoginPage({ currentUser, hasSavedSession, isAuthLoading }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to="/deals" replace />;
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

      const nextPath =
        typeof location.state?.from?.pathname === 'string' ? location.state.from.pathname : '/deals';

      navigate(nextPath, { replace: true });
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

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__intro">
          <p className="login-panel__eyebrow">Account access</p>
          <h1>Sign in to your DealBazaar account</h1>
          <p>Access store tools, saved activity, and marketplace actions from one place.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {hasSavedSession ? (
            <div className="login-form__session-note">
              <p>
                {isAuthLoading
                  ? 'Checking your saved session...'
                  : 'A saved session was found on this browser.'}
              </p>
              <div className="login-form__session-actions">
                <button type="button" className="button button--ghost" onClick={handleClearSession}>
                  Sign out here
                </button>
              </div>
            </div>
          ) : null}

          <label className="login-field">
            <span className="login-field__label">Email</span>
            <div className="login-field__control">
              <Mail size={16} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(event) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: event.target.value,
                  }));
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="login-field">
            <span className="login-field__label">Password</span>
            <div className="login-field__control">
              <KeyRound size={16} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={(event) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    password: event.target.value,
                  }));
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </label>

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-form__actions">
            <button type="submit" className="button button--primary" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle size={18} className="login-form__spinner" /> : <ArrowRight size={18} />}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <Link to="/deals" className="button button--secondary">
              Back to deals
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
