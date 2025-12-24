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
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
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

  // Handle Logout Logic
  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  }, [router]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success',  duration: number = 5000) => {
  const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getErrorMessage = (err: any, fallback: string) => {
    return err.response?.data?.message || err.response?.data?.error || fallback;
  };

  // 1. SETUP AXIOS INTERCEPTORS
  useEffect(() => {
    // Interseptor Request: Tambahkan Token ke Header
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (token) { config.headers.Authorization = `Bearer ${token}`; }
        if (refreshToken) { config.headers['x-refresh-token'] = refreshToken; }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interseptor Response: Tangani 401 Unauthorized secara global
    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        const newAccessToken = response.headers['x-access-token'];
        if (newAccessToken) {
          localStorage.setItem('access_token', newAccessToken);
          const payload = decodeToken(newAccessToken);
          if (payload) setUser({ email: payload.email || payload.sub, nama_depan: 'Admin' });
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          showToast('Sesi telah berakhir, silakan login kembali', 'error', 8000);
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [handleLogout, showToast]);

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
        const { access_token, refresh_token } = res.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        const payload = decodeToken(access_token);
        setUser({ email: payload.email || payload.sub, nama_depan: 'Admin' });
        setIsAuthenticated(true);
        
        await fetchData();
        router.push('/dashboard');
        return true;
      } catch (err: any) {
        showToast(getErrorMessage(err, 'Login Gagal, periksa kembali email dan password'), 'error', 8000);
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
    // Admin CRUD
    addAdmin: async (a: any) => {
      try {
        await api.post('/admin', a);
        await fetchData();
        showToast('Admin berhasil ditambahkan', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal menambahkan admin'), 'error', 8000);
      }
    },
    updateAdmin: async (email: string, a: any) => {
      try {
        await api.put(`/admin/${email}`, a);
        await fetchData();
        showToast('Admin berhasil diperbarui', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal memperbarui admin'), 'error', 8000);
      }
    },
    deleteAdmin: async (email: string) => {
      try {
        await api.delete(`/admin/${email}`);
        await fetchData();
        showToast('Admin berhasil dihapus', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal menghapus admin'), 'error', 8000);
      }
    },
    // Employee CRUD
    addEmployee: async (e: any) => {
      try {
        await api.post('/pegawai', e);
        await fetchData();
        showToast('Pegawai berhasil ditambahkan', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal menambahkan pegawai'), 'error', 8000);
      }
    },
    updateEmployee: async (email: string, e: any) => {
      try {
        await api.put(`/pegawai/${email}`, e);
        await fetchData();
        showToast('Pegawai berhasil diperbarui', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal memperbarui pegawai'), 'error', 8000);
      }
    },
    deleteEmployee: async (email: string) => {
      try {
        await api.delete(`/pegawai/${email}`);
        await fetchData();
        showToast('Pegawai berhasil dihapus', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal menghapus pegawai'), 'error', 8000);
      }
    },
    // Leave CRUD
    addLeave: async (l: any) => {
      try {
        await api.post('/cuti', l);
        await fetchData();
        showToast('Pengajuan cuti berhasil dikirim', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal membuat pengajuan cuti'), 'error', 8000);
      }
    },
    updateLeave: async (id: number, l: any) => {
      try {
        await api.patch(`/cuti/${id}`, l);
        await fetchData();
        showToast('Status cuti berhasil diperbarui', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal memperbarui data cuti'), 'error', 8000);
      }
    },
    deleteLeave: async (id: number) => {
      try {
        await api.delete(`/cuti/${id}`);
        await fetchData();
        showToast('Data cuti berhasil dihapus', 'success');
      } catch (err) {
        showToast(getErrorMessage(err, 'Gagal menghapus data cuti'), 'error', 8000);
      }
    },
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