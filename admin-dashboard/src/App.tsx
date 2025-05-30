import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { SimpleLayout } from './components/SimpleLayout';
import { LoginPage } from './pages/LoginPage';
import { EnhancedDashboardPage } from './pages/EnhancedDashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { CompletedLeadsPage } from './pages/CompletedLeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { FollowUpPage } from './pages/FollowUpPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SqueegeeTransferPage } from './pages/SqueegeeTransferPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component (redirects if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <EnhancedDashboardPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <LeadsPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <LeadDetailPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/follow-ups"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <FollowUpPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/completed-leads"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <CompletedLeadsPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/squeegee-transfer"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <SqueegeeTransferPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <AnalyticsPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SimpleLayout>
                    <SettingsPage />
                  </SimpleLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F9FAFB',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F9FAFB',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;