// React Imports
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Material UI Imports
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
// Context Imports
import { SessionProvider } from '@contexts';
import UserDataContextProvider from './contexts/UserDataContext';
import { NotificationContextProvider } from './contexts/NotificationContext';
// Theme Imports
import theme from './theme';
// Route Imports
import AppRoutes from './AppRoutes';
import Layout from './layouts/Layout';

const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 // One minute
    }
  }
};
const queryClient = new QueryClient(queryClientConfig);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider restorePreviousSession>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <NotificationContextProvider>
          <UserDataContextProvider>
            <BrowserRouter>
              <Layout>
                <AppRoutes />
              </Layout>
            </BrowserRouter>
          </UserDataContextProvider>
        </NotificationContextProvider>
      </ThemeProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
