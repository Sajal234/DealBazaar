import { ArrowRight, Building2, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { Link } from 'react-router-dom';

const onboardingSteps = [
  {
    title: 'Apply once',
    description: 'Submit your store profile, documents, and contact details for review.',
    icon: Building2,
  },
  {
    title: 'Get approved',
    description: 'Admins verify the store so shoppers only see credible local inventory.',
    icon: CheckCircle2,
  },
  {
    title: 'Publish clean deals',
    description: 'Create time-limited offers without the clutter of old classified workflows.',
    icon: LayoutTemplate,
  },
];

export function StorePage() {
  return (
    <div className="page">
      <section className="page-hero">
        <div>
          <p className="page-hero__eyebrow">For merchants</p>
          <h1>Give your store a cleaner digital surface.</h1>
          <p>
            This route sets up the merchant-facing entry point so we can plug in store application
            and deal management without reworking navigation later.
          </p>
        </div>

        <div className="page-hero__actions">
          <Link to="/login" className="button button--primary">
            Continue to sign in
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="three-up-grid" aria-label="Store onboarding steps">
        {onboardingSteps.map((step) => {
          const Icon = step.icon;

          return (
            <article key={step.title} className="panel-card">
              <div className="feature-card__icon">
                <Icon size={18} />
              </div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
