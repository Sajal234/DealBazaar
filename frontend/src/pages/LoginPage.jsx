import { LockKeyhole, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  return (
    <div className="page page--split">
      <section className="panel-card editorial-card">
        <p className="page-hero__eyebrow">Secure access</p>
        <h1>Sign in for store and admin workflows.</h1>
        <p>
          This route is now in place so we can wire real authentication next without revisiting
          the page structure.
        </p>

        <div className="editorial-list" aria-label="Authentication benefits">
          <div>
            <ShieldCheck size={18} />
            <span>Role-aware access for store owners and admins</span>
          </div>
          <div>
            <LockKeyhole size={18} />
            <span>Protected moderation and self-service store management</span>
          </div>
        </div>
      </section>

      <section className="panel-card auth-card">
        <div className="auth-card__header">
          <p className="page-hero__eyebrow">Account access</p>
          <h2>Authentication wiring is next.</h2>
          <p>The layout and route are ready. The API connection lands in the next slice.</p>
        </div>

        <form className="auth-form">
          <label className="field">
            <span>Email</span>
            <input type="email" placeholder="owner@store.com" disabled />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" placeholder="Enter your password" disabled />
          </label>

          <button type="button" className="button button--primary" disabled>
            Sign in
          </button>
        </form>
      </section>
    </div>
  );
}
