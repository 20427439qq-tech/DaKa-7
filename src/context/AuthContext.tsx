import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (name: string, password: string, role: 'admin' | 'member') => { success: boolean, message?: string };
  logout: () => void;
  updatePassword: (newPassword: string) => void;
  addUser: (newUser: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetPassword: (id: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('auth_user', null);
  const [users, setUsers] = useLocalStorage<User[]>('team_users', MOCK_USERS);

  // Version 1.0.0 cleanup: Clear old check-in data from local storage
  useEffect(() => {
    const currentVersion = '1.0.0';
    const savedVersion = window.localStorage.getItem('app_version');
    if (savedVersion !== currentVersion) {
      window.localStorage.removeItem('team_checkins');
      window.localStorage.setItem('app_version', currentVersion);
      // Reload to ensure state is fresh if this was an update
      if (savedVersion) window.location.reload();
    }
  }, []);

  const login = (name: string, password: string, selectedRole: 'admin' | 'member') => {
    // Find user by name
    const existingUser = users.find(u => u.name === name);
    
    if (existingUser) {
      // Check password (special case for main admin)
      const correctPassword = existingUser.id === 'admin' ? '20262026' : existingUser.password;
      
      if (password === correctPassword) {
        // If trying to enter as admin, check if they have the role
        if (selectedRole === 'admin' && existingUser.role !== 'admin') {
          return { success: false, message: '您没有纪委权限' };
        }

        setUser(existingUser);
        return { success: true };
      } else {
        return { success: false, message: '密码错误' };
      }
    } else {
      return { success: false, message: '用户不存在' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updatePassword = (newPassword: string) => {
    if (!user) return;
    
    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);
    
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const id = `u${Date.now()}`;
    setUsers(prev => [...prev, { ...newUser, id }]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (user?.id === id) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (id: string) => {
    if (id === 'admin') return; // Prevent deleting admin
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const resetPassword = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: '2026' } : u));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      login, 
      logout, 
      updatePassword, 
      addUser,
      updateUser,
      deleteUser,
      resetPassword,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
