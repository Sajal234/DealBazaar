import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthSessionSync } from './features/auth/AuthSessionSync';
import { AppErrorBoundary } from './layout/AppErrorBoundary';
import './styles/index.css';
import './styles/commerce.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthSessionSync />
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
