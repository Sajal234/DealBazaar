import { KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useChangePasswordMutation } from './auth.queries';

export function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const changePasswordMutation = useChangePasswordMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
      setLocalError('Fill in all password fields before submitting.');
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setLocalError('New password and confirmation must match.');
      return;
    }

    if (trimmedNewPassword.length < 6 || !/\d/.test(trimmedNewPassword)) {
      setLocalError('New password must be at least 6 characters and include at least one number.');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: trimmedCurrentPassword,
        newPassword: trimmedNewPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password updated. Older signed-in sessions now need a fresh login.');
    } catch (error) {
      setLocalError(error?.message || 'Unable to update password right now.');
    }
  };

  return (
    <section className="account-card" aria-labelledby="account-password-title">
      <div className="account-card__header">
        <div>
          <p className="account-card__eyebrow">Password</p>
          <h2 id="account-password-title">Keep your account secure</h2>
        </div>
        <div className="account-card__icon">
          <KeyRound size={18} />
        </div>
      </div>

      <p className="account-card__description">
        Confirm your current password, then set a new one. Existing tokens become invalid after this change.
      </p>

      <form className="account-password-form" onSubmit={handleSubmit}>
        <label className="account-password-form__field">
          <span>Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
            }}
            autoComplete="current-password"
            placeholder="Enter current password"
          />
        </label>

        <label className="account-password-form__field">
          <span>New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
            }}
            autoComplete="new-password"
            placeholder="At least 6 characters and 1 number"
          />
        </label>

        <label className="account-password-form__field">
          <span>Confirm new password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
            autoComplete="new-password"
            placeholder="Re-enter new password"
          />
        </label>

        <p className="account-password-form__hint">
          Passwords must be at least 6 characters and include at least one number.
        </p>

        {localError ? (
          <p className="account-password-form__error" role="alert">
            {localError}
          </p>
        ) : null}

        {successMessage ? (
          <p className="account-password-form__success" role="status">
            <ShieldCheck size={16} />
            {successMessage}
          </p>
        ) : null}

        <div className="account-password-form__actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <>
                <LoaderCircle size={16} className="login-form__spinner" />
                Updating password
              </>
            ) : (
              'Update password'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
