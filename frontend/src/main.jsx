import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth-context';
import queryClient from '@/utils/queryClient';
import App from '@/App';
import '@/index.css';
import { DataProvider } from '@/contexts/data-context';
import { Toaster } from './components/ui/sonner';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>

      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
          <Toaster />
        </DataProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);