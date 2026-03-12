import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query
} from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getDocFromCache, getDocFromServer } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (name: string, password: string, selectedRole: 'admin' | 'member') => Promise<{ success: boolean, message?: string, mustChange?: boolean }>;
  logout: () => void;
  updatePassword: (newPassword: string) => Promise<void>;
  completePasswordChange: () => void;
  addUser: (newUser: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetPassword: (id: string) => Promise<void>;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
        // Skip logging for other errors, as this is simply a connection test.
      }
    }
    testConnection();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // If it's the super admin email, ensure the 'admin' user is linked
          if (firebaseUser.email === "20427439qq@gmail.com") {
             const adminDoc = await getDoc(doc(db, 'users', 'admin'));
             if (!adminDoc.exists()) {
               const adminUser: User = {
                 id: 'admin',
                 name: "超级管理员",
                 roles: ["admin", "jiwei"],
                 country: "中国",
                 mustChangePassword: false
               };
               await setDoc(doc(db, 'users', 'admin'), adminUser);
               await setDoc(doc(db, 'secrets', 'admin'), { password: 'admin' });
               setUser(adminUser);
             } else {
               setUser(adminDoc.data() as User);
             }
          } else {
            // For other users, we don't automatically set user state here
            // to avoid overwriting the custom login state
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/admin`);
        }
      } else {
        // Automatically sign in anonymously if not authenticated
        // This allows the user to have a UID for Firestore rules
        try {
          await signInAnonymously(auth);
          setAuthError(null);
        } catch (error: any) {
          console.warn("Anonymous sign-in skipped or failed:", error.message);
          // We no longer set authError here because the app can function without it
          // due to relaxed security rules for the prototype.
          setIsAuthReady(true);
        }
        return; // Exit early, the next onAuthStateChanged will handle it
      }
      setIsAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Listen for users collection changes when auth is ready
  useEffect(() => {
    if (!isAuthReady) return;

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      if (snapshot.empty) {
        // Bootstrap mock users
        try {
          const { MOCK_USERS } = await import('../data/mockData');
          for (const mockUser of MOCK_USERS) {
            const { password, ...userData } = mockUser;
            const mustChange = mockUser.id !== 'admin';
            await setDoc(doc(db, 'users', mockUser.id), { ...userData, mustChangePassword: mustChange });
            await setDoc(doc(db, 'secrets', mockUser.id), { password: password || '2026' });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'users');
        }
      } else {
        const usersList = snapshot.docs.map(doc => doc.data() as User);
        setUsers(usersList);
      }
    }, (error) => {
      console.error("Users list error:", error);
      // Don't throw if it's just a permission error on the initial load
      // handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribeUsers();
  }, [isAuthReady]);

  const login = async (name: string, password: string, selectedRole: 'admin' | 'member') => {
    // Find user by name in the users list
    const existingUser = users.find(u => u.name === name);
    
    if (existingUser) {
      try {
        // Fetch the password from the secrets collection
        const secretDoc = await getDoc(doc(db, 'secrets', existingUser.id));
        let correctPassword = '2026'; // Default
        
        if (secretDoc.exists()) {
          correctPassword = secretDoc.data().password;
        } else if (existingUser.id === 'admin') {
          correctPassword = '20262026';
        }
        
        if (password === correctPassword) {
          const roles = existingUser.roles || [];
          if (selectedRole === 'admin' && !roles.includes('admin') && !roles.includes('jiwei')) {
            return { success: false, message: '您没有纪委权限' };
          }

          // Ensure we are authenticated with Firebase
          let firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            try {
              const cred = await signInAnonymously(auth);
              firebaseUser = cred.user;
            } catch (authError: any) {
              console.warn("Anonymous sign-in failed during login:", authError.message);
              // We still proceed, but Firestore writes might fail later if rules require auth
            }
          }

          // Set the user state
          setUser(existingUser);
          
          if (existingUser.mustChangePassword && existingUser.id !== 'admin') {
            return { success: true, mustChange: true };
          }
          
          return { success: true };
        } else {
          return { success: false, message: '密码错误' };
        }
      } catch (error: any) {
        console.error("Login error:", error);
        return { success: false, message: '登录失败: ' + (error.message || '未知错误') };
      }
    } else {
      return { success: false, message: '用户不存在' };
    }
  };

  const logout = () => {
    auth.signOut();
    setUser(null);
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'secrets', user.id), { password: newPassword });
      await updateDoc(doc(db, 'users', user.id), { mustChangePassword: false });
      // We don't update the user state here immediately so the success message can be shown.
      // The component will call a separate function or we just update it after a delay.
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `secrets/${user.id}`);
      throw error;
    }
  };

  const completePasswordChange = () => {
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : null);
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    const id = `u${Date.now()}`;
    const { password, ...userData } = newUser;
    try {
      // Save user info (public)
      await setDoc(doc(db, 'users', id), { ...userData, id, mustChangePassword: true });
      // Save password (private)
      await setDoc(doc(db, 'secrets', id), { password: password || '2026' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${id}`);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const { password, ...userData } = updates;
    try {
      if (Object.keys(userData).length > 0) {
        await updateDoc(doc(db, 'users', id), userData);
      }
      if (password) {
        await setDoc(doc(db, 'secrets', id), { password });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  };

  const deleteUser = async (id: string) => {
    if (id === 'admin') return;
    try {
      await deleteDoc(doc(db, 'users', id));
      await deleteDoc(doc(db, 'secrets', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  };

  const resetPassword = async (id: string) => {
    try {
      await setDoc(doc(db, 'secrets', id), { password: '2026' });
      await updateDoc(doc(db, 'users', id), { mustChangePassword: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `secrets/${id}`);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      login, 
      logout, 
      updatePassword, 
      completePasswordChange,
      addUser,
      updateUser,
      deleteUser,
      resetPassword,
      isAuthenticated: !!user,
      isAuthReady,
      authError
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
