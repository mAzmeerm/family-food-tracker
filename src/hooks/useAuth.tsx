import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, loginWithEmail, logoutUser, createFamilyAccount, loginWithGoogle } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      await loginWithEmail(email, pass);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    }
  };

  const register = async (email: string, pass: string) => {
    setError(null);
    try {
      await createFamilyAccount(email, pass);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
    } catch (err: any) {
      setError(err.message || 'Logout failed.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, signInWithGoogle, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
