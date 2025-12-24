'use client';

import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Admin, Employee, LeaveRequest, Toast } from '../types';
import { ToastContainer } from '../components/UIComponents';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// --- Types ---
interface AuthContextType {
  user: Partial<Admin> | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface DataContextType {
  admins: Admin[];
  employees: Employee[];
  leaves: LeaveRequest[];
  addAdmin: (a: Omit<Admin, 'created_at' | 'updated_at'>) => Promise<void>;
  updateAdmin: (email: string, a: Partial<Admin>) => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  addEmployee: (e: Omit<Employee, 'created_at' | 'updated_at'>) => Promise<void>;
  updateEmployee: (email: string, e: Partial<Employee>) => Promise<void>;
  deleteEmployee: (email: string) => Promise<void>;
  addLeave: (l: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLeave: (id: number, l: Partial<LeaveRequest>) => Promise<void>;
  deleteLeave: (id: number) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
export const DataContext = createContext<DataContextType | null>(null);

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const CombinedProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Partial<Admin> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rawLeaves, setRawLeaves] = useState<LeaveRequest[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();

  // 1. SETUP AXIOS INTERCEPTORS
  useEffect(() => {
    // Interseptor Request: Tambahkan Token ke Header
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interseptor Response: Tangani 401 Unauthorized secara global
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fungsi Fetch Data (Panggil setelah login sukses)
  const fetchData = useCallback(async () => {
    try {
      const [resAdmins, resEmps, resLeaves] = await Promise.all([
        api.get('/admin'),
        api.get('/pegawai'),
        api.get('/cuti')
      ]);
      setAdmins(resAdmins.data.data || []);
      setEmployees(resEmps.data.data || []);
      setRawLeaves(resLeaves.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data dari API", err);
    }
  }, []);

  // Handle Logout Logic
  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  }, [router]);

   // Fungsi untuk decode JWT sederhana
  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = decodeToken(token);
      if (payload) {
        setIsAuthenticated(true);
        setUser({ email: payload.email || payload.sub, nama_depan: 'Admin' });
        fetchData();
      } else {
        handleLogout();
      }
    }
    setIsLoading(false);
  }, [fetchData, handleLogout]);

  const authValue = {
    user,
    isAuthenticated,
    isLoading,
    login: async (email: string, password: string) => {
      try {
        const res = await api.post('/auth/login', { email, password });
        const { access_token } = res.data;

        localStorage.setItem('access_token', access_token);
        
        const payload = decodeToken(access_token);
        setUser({ email: payload.email || payload.sub, nama_depan: 'Admin' });
        setIsAuthenticated(true);
        
        await fetchData();
        router.push('/dashboard');
        return true;
      } catch (err: any) {
        showToast('Login Gagal', 'error');
        return false;
      }
    },
    logout: handleLogout
  };

  const leaves = useMemo(() => {
  if (!Array.isArray(rawLeaves)) return [];

  return rawLeaves.map((leave: any) => {
    const pegawaiFromApi = leave.pegawai;
    const pegawaiEnriched = pegawaiFromApi || employees.find(e => e.email === leave.pegawaiEmail);
    return {
      ...leave,
      pegawai: pegawaiEnriched,
      pegawaiEmail: leave.pegawaiEmail || pegawaiEnriched?.email || '---'
    };
  });
}, [rawLeaves, employees]);

  const dataValue = {
    admins, employees, leaves, showToast,
    addAdmin: async (a: any) => { await api.post('/admin', a); fetchData(); },
    updateAdmin: async (email: string, a: any) => { await api.put(`/admin/${email}`, a); fetchData(); },
    deleteAdmin: async (email: string) => { await api.delete(`/admin/${email}`); fetchData(); },
    addEmployee: async (e: any) => { await api.post('/pegawai', e); fetchData(); },
    updateEmployee: async (email: string, e: any) => { await api.put(`/pegawai/${email}`, e); fetchData(); },
    deleteEmployee: async (email: string) => { await api.delete(`/pegawai/${email}`); fetchData(); },
    addLeave: async (l: any) => { await api.post('/cuti', l); fetchData(); },
    updateLeave: async (id: number, l: any) => { await api.patch(`/cuti/${id}`, l); fetchData(); },
    deleteLeave: async (id: number) => { await api.delete(`/cuti/${id}`); fetchData(); },
  };

  return (
    <AuthContext.Provider value={authValue}>
      <DataContext.Provider value={dataValue}>
        {children}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </DataContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within CombinedProvider");
  return context;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within CombinedProvider");
  return context;
};