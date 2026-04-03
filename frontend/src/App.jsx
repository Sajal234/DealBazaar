import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DealsPage } from './pages/DealsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { StorePage } from './pages/StorePage';

const themeStorageKey = 'dealbazaar.theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  let storedTheme = null;

  try {
    storedTheme = window.localStorage.getItem(themeStorageKey);
  } catch {
    storedTheme = null;
  }

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(themeStorageKey, theme);
      } catch {}
    }
  }, [theme]);

  return (
    <Routes>
      <Route
        element={
          <AppLayout
            theme={theme}
            onToggleTheme={() =>
              setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
            }
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
