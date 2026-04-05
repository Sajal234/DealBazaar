import { Component } from 'react';
import { AlertTriangle, Compass, RefreshCw } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

class AppErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[App Error Boundary]', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="page-shell">
        <section className="state-card state-card--error" aria-live="assertive">
          <AlertTriangle size={20} />
          <div>
            <p className="page-header__eyebrow">Application error</p>
            <h2>Something went wrong while loading this screen.</h2>
            <p>
              The page hit an unexpected problem. You can try this view again or jump back into the marketplace.
            </p>

            <div className="state-card__actions">
              <button type="button" className="button button--primary" onClick={this.handleRetry}>
                <RefreshCw size={16} />
                Try again
              </button>
              <Link to="/" className="button button--secondary">
                <Compass size={16} />
                Go home
              </Link>
              <Link to="/deals" className="button button--ghost">
                Browse deals
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export function AppErrorBoundary({ children }) {
  const location = useLocation();
  const resetKey = `${location.pathname}${location.search}${location.hash}`;

  return <AppErrorBoundaryInner resetKey={resetKey}>{children}</AppErrorBoundaryInner>;
}
