import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { DealDetailPage } from './pages/DealDetailPage';
import { DealsPage } from './pages/DealsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

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
    <AppLayout theme={theme} setTheme={setTheme}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:dealId" element={<DealDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
