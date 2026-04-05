import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useCurrentUserQuery } from './features/auth/auth.queries';
import { readAuthSession } from './features/auth/auth.session';
import { RequireAuth } from './features/auth/RequireAuth';
import { RequireRole } from './features/auth/RequireRole';
import { AppLayout } from './layout/AppLayout';
import { AdminPage } from './pages/AdminPage';
import { AccountPage } from './pages/AccountPage';
import { DealDetailPage } from './pages/DealDetailPage';
import { DealsPage } from './pages/DealsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
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
  const { data: currentUser, isLoading: isAuthLoading, isFetching: isAuthFetching } = useCurrentUserQuery();
  const hasSavedSession = Boolean(readAuthSession()?.token);

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
    <AppLayout theme={theme} setTheme={setTheme} currentUser={currentUser}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:dealId" element={<DealDetailPage currentUser={currentUser} />} />
        <Route
          path="/login"
          element={
            <LoginPage
              currentUser={currentUser}
              hasSavedSession={hasSavedSession}
              isAuthLoading={isAuthLoading || isAuthFetching}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <SignupPage
              currentUser={currentUser}
              hasSavedSession={hasSavedSession}
              isAuthLoading={isAuthLoading || isAuthFetching}
            />
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth
              currentUser={currentUser}
              hasSavedSession={hasSavedSession}
              isAuthLoading={isAuthLoading || isAuthFetching}
            >
              <AccountPage currentUser={currentUser} />
            </RequireAuth>
          }
        />
        <Route
          path="/store"
          element={
            <RequireAuth
              currentUser={currentUser}
              hasSavedSession={hasSavedSession}
              isAuthLoading={isAuthLoading || isAuthFetching}
            >
              <RequireRole currentUser={currentUser} deny={['admin']}>
                <StorePage currentUser={currentUser} />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth
              currentUser={currentUser}
              hasSavedSession={hasSavedSession}
              isAuthLoading={isAuthLoading || isAuthFetching}
            >
              <RequireRole currentUser={currentUser} allow={['admin']}>
                <AdminPage currentUser={currentUser} />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
