import { useState } from 'react';
import { ArrowRight, LoaderCircle, Mail } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { requestPasswordReset } from '../features/auth/auth.api';
import { getDefaultAuthenticatedPath } from '../features/auth/auth.redirects';
import '../styles/login.css';

export function ForgotPasswordPage({ currentUser }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [debugResetPath, setDebugResetPath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to={getDefaultAuthenticatedPath(currentUser)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError('Enter your email to request a password reset.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    setDebugResetPath('');

    try {
      const result = await requestPasswordReset({ email: email.trim() });
      setSuccessMessage(result.message || 'If an account exists for that email, password reset instructions are ready.');
      setDebugResetPath(result.debugResetPath || '');
    } catch (submissionError) {
      setError(submissionError.message || 'Could not start password recovery right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__intro">
          <p className="login-panel__eyebrow">Password recovery</p>
          <h1>Reset your DealBazaar password</h1>
          <p>Enter your account email and we will prepare a password reset link for that account.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span className="login-field__label">Email</span>
            <div className="login-field__control">
              <Mail size={16} />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </label>

          {successMessage ? (
            <p className="login-form__success" role="status">
              {successMessage}
            </p>
          ) : null}

          {debugResetPath ? (
            <p className="login-form__hint">
              Development reset link:{' '}
              <Link to={debugResetPath} className="login-form__support-link">
                Open password reset
              </Link>
            </p>
          ) : null}

          {error ? (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="login-form__actions">
            <button type="submit" className="button button--primary" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle size={18} className="login-form__spinner" /> : <ArrowRight size={18} />}
              {isSubmitting ? 'Sending...' : 'Send reset link'}
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
