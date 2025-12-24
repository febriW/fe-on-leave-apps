'use client';

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { api, setTokens, clearTokens, decodeToken, getErrorMessage } from '@/lib/api';
import { useToast } from './ToastContext';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const { showToast } = useToast();

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (refreshToken) config.headers['x-refresh-token'] = refreshToken;
      
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        const newAccessToken = response.headers['x-access-token'];
        if (newAccessToken) {
          const refreshToken = localStorage.getItem('refresh_token') || '';
          setTokens(newAccessToken, refreshToken);
          
          const payload = decodeToken(newAccessToken);
          if (payload) setUser({ 
            email: payload.email || payload.sub, 
            nama_depan: payload.nama_depan || 'Admin' 
          });
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          showToast('Sesi berakhir, silakan login kembali', 'error');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, showToast]);

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const payload = decodeToken(token);
          if (payload) {
            setIsAuthenticated(true);
            setUser({ 
              email: payload.email || payload.sub, 
              nama_depan: payload.nama_depan || 'Admin' 
            });
          } else {
            logout();
          }
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [logout]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;

      setTokens(access_token, refresh_token);
      
      const payload = decodeToken(access_token);
      setUser({ 
        email: payload.email || payload.sub, 
        nama_depan: payload.nama_depan || 'Admin' 
      });
      setIsAuthenticated(true);
      
      showToast('Login Berhasil', 'success');
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      showToast(getErrorMessage(err, 'Login Gagal, periksa kredensial Anda'), 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};