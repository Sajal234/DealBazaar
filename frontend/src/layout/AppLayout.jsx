import { Moon, SunMedium } from 'lucide-react';

export function AppLayout({ children, theme, setTheme }) {
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" className="brand__mark-image" />
          </div>
          <div>
            <p className="brand__name">DealBazaar</p>
            <p className="brand__subtext">Verified local commerce.</p>
          </div>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
          aria-label={nextThemeLabel}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {children}
    </div>
  );
}
