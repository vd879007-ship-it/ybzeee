'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot-password';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot-password') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'yezbee-auth-token';
const REFRESH_KEY = 'yezbee-refresh-token';
const USER_KEY = 'yezbee-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const router = useRouter();

  const openAuthModal = useCallback((mode: 'login' | 'register' | 'forgot-password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (token) {
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          try {
            const profileRes = await api.getProfile();
            if (profileRes?.data) {
              const freshUser = profileRes.data.user || profileRes.data;
              const formattedUser: User = {
                id: freshUser._id || freshUser.id,
                name: freshUser.name,
                email: freshUser.email,
                phone: freshUser.phone,
                avatar: freshUser.avatar,
                role: freshUser.role || 'customer',
              };
              setUser(formattedUser);
              localStorage.setItem(USER_KEY, JSON.stringify(formattedUser));
            }
          } catch (e) {
          }
        }
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login(email, password);
      
      const access = res.data?.access || (res.data as any)?.token;
      const refresh = res.data?.refresh || (res.data as any)?.refreshToken;
      const rawUser = res.data?.user;

      if (!access || !rawUser) {
        throw new Error(res.message || 'Invalid server response');
      }

      const formattedUser: User = {
        id: rawUser._id || rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        phone: rawUser.phone,
        avatar: rawUser.avatar,
        role: rawUser.role || 'customer',
      };

      localStorage.setItem(TOKEN_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
      localStorage.setItem(USER_KEY, JSON.stringify(formattedUser));

      setUser(formattedUser);
      setIsAuthModalOpen(false);
      toast.success(`Welcome back, ${formattedUser.name}! ✨`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.register(data);

      const access = res.data?.access || (res.data as any)?.token;
      const refresh = res.data?.refresh || (res.data as any)?.refreshToken;
      const rawUser = res.data?.user;

      if (!access || !rawUser) {
        throw new Error(res.message || 'Registration failed');
      }

      const formattedUser: User = {
        id: rawUser._id || rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        phone: rawUser.phone,
        avatar: rawUser.avatar,
        role: rawUser.role || 'customer',
      };

      localStorage.setItem(TOKEN_KEY, access);
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
      localStorage.setItem(USER_KEY, JSON.stringify(formattedUser));

      setUser(formattedUser);
      setIsAuthModalOpen(false);
      toast.success(`Account created successfully! Welcome, ${formattedUser.name} ✨`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setError(null);

    try {
      const res = await api.updateProfile(data);
      if (res.data) {
        const rawUser = res.data.user || res.data;
        const formattedUser: User = {
          id: rawUser._id || rawUser.id,
          name: rawUser.name,
          email: rawUser.email,
          phone: rawUser.phone,
          avatar: rawUser.avatar,
          role: rawUser.role || 'customer',
        };
        setUser(formattedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(formattedUser));
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Update failed';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
