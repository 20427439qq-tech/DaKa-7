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

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
