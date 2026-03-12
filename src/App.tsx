/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { MyCheckinPage } from './pages/MyCheckinPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';

import { AdminPage } from './pages/AdminPage';
import { TaskMaintenancePage } from './pages/TaskMaintenancePage';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Force password change if required (except for super admin)
  if (user?.mustChangePassword && user.id !== 'admin') {
    return <ChangePasswordPage force={true} />;
  }

  // Admin routing
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('admin') || userRoles.includes('jiwei');
  if (isAdmin) {
    if (hash === '#dashboard') {
      return <DashboardPage />;
    }
    if (hash === '#admin') {
      return <AdminPage />;
    }
    if (hash === '#tasks') {
      return <TaskMaintenancePage />;
    }
    if (hash === '#history') {
      return <HistoryPage />;
    }
    if (hash === '#password') {
      return <ChangePasswordPage />;
    }
    if (hash === '') {
      return <MyCheckinPage />;
    }
    return <AdminPage />;
  }

  // Member routing
  if (hash === '#history') {
    return <HistoryPage />;
  }

  if (hash === '#password') {
    return <ChangePasswordPage />;
  }

  return <MyCheckinPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
