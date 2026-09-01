import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authServices, userServices } from '../services/api';

type AuthSession = { user: { id: string }; token: string };
type AuthError = { message: string };

interface AuthContextData {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateUser: (updates: Partial<User>) => Promise<{ error: AuthError | null }>;
  isAuthenticated: boolean;
  isVisitor: () => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authServices.getSession().then((res) => {
      const persistedSession = res.data.session;
      if (persistedSession?.user.id) {
        setSession(persistedSession);
        loadUserProfile(persistedSession.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await userServices.getProfile(userId);
      if (data && !error) {
        setUser(data);
        await AsyncStorage.setItem('userRole', data.role);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { data, error } = await authServices.signUp(email, password, {
      name: userData.name,
      role: userData.role || 'adopter',
      phone: userData.phone,
      city: userData.city,
      state: userData.state,
    });

    if (error) return { error };

    if (data.user && data.session) {
      setUser(data.user);
      setSession(data.session);
      await AsyncStorage.setItem('userRole', data.user.role);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authServices.signIn(email, password);
    if (error) return { error };

    if (data.user) {
      setSession(data.session);
      await loadUserProfile(data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await authServices.signOut();
    setUser(null);
    setSession(null);
    await AsyncStorage.removeItem('userRole');
  };

  const resetPassword = async (email: string) => authServices.resetPassword(email);

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return { error: { message: 'Nenhum usuario logado.' } };

    const { error } = await userServices.updateProfile(user.id, updates);
    if (!error) {
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    }

    return { error };
  };

  const isVisitor = () => !user || user.role === 'visitor';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateUser,
        isAuthenticated: !!user,
        isVisitor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
