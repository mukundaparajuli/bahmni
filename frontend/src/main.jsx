import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth-context';
import queryClient from '@/utils/queryClient';
import App from '@/App';
import '@/index.css';
import { DataProvider } from '@/contexts/data-context';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DataProvider>
    </QueryClientProvider>
  </React.StrictMode>
);