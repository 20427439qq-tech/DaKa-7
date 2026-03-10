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

  // Admin/Jiwei routing
  if (user?.roles.includes('admin') || user?.roles.includes('jiwei')) {
    if (hash === '#dashboard') {
      return <DashboardPage />;
    }
    if (hash === '#admin' && user?.roles.includes('admin')) {
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
    // Default for privileged users
    return user?.roles.includes('admin') ? <AdminPage /> : <DashboardPage />;
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
