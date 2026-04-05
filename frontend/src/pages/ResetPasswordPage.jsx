import { useState } from 'react';
import { ArrowRight, KeyRound, LoaderCircle } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ResourceNotFoundState } from '../components/ResourceNotFoundState';
import { getPostAuthPath } from '../features/auth/auth.redirects';
import { persistAuthSession } from '../features/auth/auth.session';
import { resetPasswordWithToken } from '../features/auth/auth.api';
import '../styles/login.css';

function isValidResetToken(token) {
  return typeof token === 'string' && /^[a-f\d]{64}$/i.test(token.trim());
}

export function ResetPasswordPage({ currentUser }) {
  const navigate = useNavigate();
  const { token } = useParams();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to={getPostAuthPath(currentUser)} replace />;
  }

  if (!isValidResetToken(token)) {
    return (
      <ResourceNotFoundState
        title="Invalid reset link"
        message="This password reset link is malformed or no longer valid."
        backTo="/forgot-password"
        backLabel="Request a new link"
        secondaryTo="/login"
        secondaryLabel="Back to sign in"
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.password || !form.confirmPassword) {
      setError('Enter your new password in both fields.');
      return;
    }

    if (form.password.length < 6 || !/\d/.test(form.password)) {
      setError('Password must be at least 6 characters long and include at least one number.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const session = await resetPasswordWithToken({
        token,
        password: form.password,
      });

      persistAuthSession(session);
      navigate(getPostAuthPath(session), { replace: true });
    } catch (submissionError) {
      setError(submissionError.message || 'Could not reset your password right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__intro">
          <p className="login-panel__eyebrow">Choose a new password</p>
          <h1>Set a new password for your account</h1>
          <p>Use a secure password with at least 6 characters and at least one number.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-field__label">New password</span>
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
                placeholder="Create a new password"
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
                placeholder="Repeat your new password"
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
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </button>

            <Link to="/login" className="button button--secondary">
              Back to sign in
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
