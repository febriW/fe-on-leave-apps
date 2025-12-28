'use client';

import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { 
  Admin, Employee, LeaveRequest, 
  CreateAdminInput, CreateEmployeeInput, CreateLeaveInput, PaginatedResponse
} from '@/types';
import { api, getErrorMessage } from '@/lib/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';


interface DataContextType {
  admins: Admin[];
  employees: Employee[];
  isLoadingData: boolean;
  fetchEmployees: (page: number, limit: number) => Promise<PaginatedResponse<Employee>>;
  refreshMasterData: () => Promise<void>;
  fetchLeaves: (page: number, limit: number, search?: string) => Promise<PaginatedResponse<LeaveRequest>>;
  fetchAdmins: (page: number, limit: number) => Promise<PaginatedResponse<Admin>>;
  addAdmin: (data: CreateAdminInput) => Promise<void>;
  updateAdmin: (email: string, data: Partial<Admin>) => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  addEmployee: (data: CreateEmployeeInput) => Promise<void>;
  updateEmployee: (email: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (email: string) => Promise<void>;
  addLeave: (data: CreateLeaveInput) => Promise<void>;
  updateLeave: (id: number, data: Partial<LeaveRequest>) => Promise<void>;
  deleteLeave: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const refreshMasterData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingData(true);
    try {
      const [resAdmins, resEmps] = await Promise.all([
        api.get('/admin'),
        api.get('/pegawai')
      ]);
      
      setAdmins(resAdmins.data.data || []);
      setEmployees(resEmps.data.data || []);
    } catch (err) {
      console.error("Fetch Master Data Error:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refreshMasterData();
  }, [isAuthenticated, refreshMasterData]);
  
  const fetchLeaves = useCallback(async (page: number, limit: number, search?: string): Promise<PaginatedResponse<LeaveRequest>> => {
    try {
      let url = '';
      if (search?.includes('@')) {
        url = `/cuti/${encodeURIComponent(search)}`;
      } else {
        url = `/cuti?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      }

      const res = await api.get(url);
      const rawData = res.data.data || [];
      const normalizedData = (Array.isArray(rawData) ? rawData : [rawData]).map((item: any) => ({
        ...item,
        pegawaiEmail: item.pegawaiEmail || item.pegawai_email || item.pegawai?.email || ''
      }));

      return {
        data: normalizedData,
        total: res.data.total || (Array.isArray(rawData) ? normalizedData.length : 1),
        page: res.data.page || page,
        limit: res.data.limit || limit
      };
    } catch (err) {
      console.error("Fetch Leaves Error:", err);
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }, []);

  const executeAction = async (
    action: () => Promise<any>, 
    successMsg: string, 
    errorFallback: string,
    refreshMaster: boolean = false
  ) => {
    try {
      await action();
      if (refreshMaster) await refreshMasterData();
      showToast(successMsg, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, errorFallback), 'error', 8000);
      throw err;
    }
  };

  const fetchEmployees = useCallback(async (page: number, limit: number) => {
    try {
      const res = await api.get(`/pegawai?page=${page}&limit=${limit}`);
      return {
        data: res.data.data || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        limit: res.data.limit || limit
      };
    } catch (err) {
      console.error("Fetch Employees Error:", err);
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }, []);

  const fetchAdmins = useCallback(async (page: number, limit: number): Promise<PaginatedResponse<Admin>> => {
  try {
      const res = await api.get(`/admin?page=${page}&limit=${limit}`);
      return {
        data: res.data.data || [],
        total: res.data.total || 0,
        page: res.data.page || page,
        limit: res.data.limit || limit
      };
    } catch (err) {
      console.error("Fetch Admins Error:", err);
      return { data: [], total: 0, page: 1, limit: 10 };
    }
  }, []);

  const dataValue: DataContextType = {
    admins, 
    employees, 
    isLoadingData, 
    refreshMasterData,
    fetchLeaves,
    fetchEmployees,
    fetchAdmins,
    
    // Admin
    addAdmin: (data) => executeAction(() => api.post('/admin', data), 'Admin ditambahkan', 'Gagal', true),
    updateAdmin: (email, data) => executeAction(() => api.put(`/admin/${email}`, data), 'Admin diperbarui', 'Gagal', true),
    deleteAdmin: (email) => executeAction(() => api.delete(`/admin/${email}`), 'Admin dihapus', 'Gagal', true),
    // Employee
    addEmployee: (data) => executeAction(() => api.post('/pegawai', data), 'Pegawai ditambahkan', 'Gagal', true),
    updateEmployee: (email, data) => executeAction(() => api.put(`/pegawai/${email}`, data), 'Pegawai diperbarui', 'Gagal', true),
    deleteEmployee: (email) => executeAction(() => api.delete(`/pegawai/${email}`), 'Pegawai dihapus', 'Gagal', true),
    // Leaves
    addLeave: (data) => executeAction(() => api.post('/cuti', data), 'Cuti diajukan', 'Gagal'),
    updateLeave: (id, data) => executeAction(() => api.patch(`/cuti/${id}`, data), 'Status diperbarui', 'Gagal'),
    deleteLeave: (id) => executeAction(() => api.delete(`/cuti/${id}`), 'Data dihapus', 'Gagal'),
  };

  return <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};