import { useState } from 'react';
import { ArrowRight, KeyRound, LoaderCircle, Mail, UserRound } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { signupUser } from '../features/auth/auth.api';
import { clearAuthSession, persistAuthSession } from '../features/auth/auth.session';
import '../styles/login.css';

export function SignupPage({ currentUser, hasSavedSession, isAuthLoading }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to="/deals" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    if (!normalizedForm.name || !normalizedForm.email || !normalizedForm.password || !normalizedForm.confirmPassword) {
      setError('Fill in every field to create your account.');
      return;
    }

    if (normalizedForm.password.length < 6 || !/\d/.test(normalizedForm.password)) {
      setError('Password must be at least 6 characters long and include at least one number.');
      return;
    }

    if (normalizedForm.password !== normalizedForm.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const session = await signupUser({
        name: normalizedForm.name,
        email: normalizedForm.email,
        password: normalizedForm.password,
      });

      persistAuthSession(session);

      const nextPath =
        typeof location.state?.from?.pathname === 'string' ? location.state.from.pathname : '/store';

      navigate(nextPath, { replace: true });
    } catch (submissionError) {
      setError(submissionError.message || 'Could not create your account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSession = () => {
    clearAuthSession();
    navigate('/signup', { replace: true });
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__intro">
          <p className="login-panel__eyebrow">Create account</p>
          <h1>Set up your DealBazaar account</h1>
          <p>Create one account to browse deals, rate stores, and unlock seller access when you are ready.</p>
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
            <span className="login-field__label">Full name</span>
            <div className="login-field__control">
              <UserRound size={16} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(event) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }));
                }}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          </label>

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
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>
          </label>

          <label className="login-field">
            <span className="login-field__label">Confirm password</span>
            <div className="login-field__control">
              <KeyRound size={16} />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={(event) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    confirmPassword: event.target.value,
                  }));
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </div>
          </label>

          <p className="login-form__hint">Passwords must be at least 6 characters and include at least one number.</p>

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-form__actions">
            <button type="submit" className="button button--primary" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle size={18} className="login-form__spinner" /> : <ArrowRight size={18} />}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <Link to="/login" className="button button--secondary">
              Already have an account?
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
