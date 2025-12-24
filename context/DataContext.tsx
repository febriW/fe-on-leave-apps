'use client';

import React, { createContext, useState, useCallback, useContext, useEffect, useMemo } from 'react';
import { 
  Admin, Employee, LeaveRequest, 
  CreateAdminInput, CreateEmployeeInput, CreateLeaveInput 
} from '@/types';
import { api, getErrorMessage } from '@/lib/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface DataContextType {
  admins: Admin[];
  employees: Employee[];
  leaves: LeaveRequest[];
  isLoadingData: boolean;
  refreshAll: () => Promise<void>;
  // Admin Actions
  addAdmin: (data: CreateAdminInput) => Promise<void>;
  updateAdmin: (email: string, data: Partial<Admin>) => Promise<void>;
  deleteAdmin: (email: string) => Promise<void>;
  // Employee Actions
  addEmployee: (data: CreateEmployeeInput) => Promise<void>;
  updateEmployee: (email: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (email: string) => Promise<void>;
  // Leave Actions
  addLeave: (data: CreateLeaveInput) => Promise<void>;
  updateLeave: (id: number, data: Partial<LeaveRequest>) => Promise<void>;
  deleteLeave: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rawLeaves, setRawLeaves] = useState<LeaveRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingData(true);
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
      console.error("Fetch Error:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refreshAll();
  }, [isAuthenticated, refreshAll]);

  const leaves = useMemo(() => {
  return rawLeaves.map((leave: any) => {
    const normalizedEmail = leave.pegawaiEmail || leave.pegawai_email || leave.pegawai?.email;
    const pegawai = leave.pegawai || employees.find(e => e.email === normalizedEmail);
    return { 
      ...leave, 
      pegawaiEmail: normalizedEmail,
      pegawai 
    };
  });
}, [rawLeaves, employees]);

  const executeAction = async (
    action: () => Promise<any>, 
    successMsg: string, 
    errorFallback: string
  ) => {
    try {
      await action();
      await refreshAll();
      showToast(successMsg, 'success');
    } catch (err) {
      showToast(getErrorMessage(err, errorFallback), 'error', 8000);
      throw err;
    }
  };

  const dataValue: DataContextType = {
    admins, employees, leaves, isLoadingData, refreshAll,
    
    addAdmin: (data) => 
      executeAction(() => api.post('/admin', data), 'Admin berhasil ditambahkan', 'Gagal menambah admin'),
    
    updateAdmin: (email, data) => 
      executeAction(() => api.put(`/admin/${email}`, data), 'Admin diperbarui', 'Gagal memperbarui admin'),
    
    deleteAdmin: (email) => 
      executeAction(() => api.delete(`/admin/${email}`), 'Admin dihapus', 'Gagal menghapus admin'),

    addEmployee: (data) => 
      executeAction(() => api.post('/pegawai', data), 'Pegawai berhasil ditambahkan', 'Gagal menambah pegawai'),
    
    updateEmployee: (email, data) => 
      executeAction(() => api.put(`/pegawai/${email}`, data), 'Pegawai diperbarui', 'Gagal memperbarui pegawai'),
    
    deleteEmployee: (email) => 
      executeAction(() => api.delete(`/pegawai/${email}`), 'Pegawai dihapus', 'Gagal menghapus pegawai'),

    addLeave: (data) => 
      executeAction(() => api.post('/cuti', data), 'Cuti berhasil diajukan', 'Gagal mengajukan cuti'),
    
    updateLeave: (id, data) => 
      executeAction(() => api.patch(`/cuti/${id}`, data), 'Status cuti diperbarui', 'Gagal memperbarui cuti'),
    
    deleteLeave: (id) => 
      executeAction(() => api.delete(`/cuti/${id}`), 'Data cuti dihapus', 'Gagal menghapus cuti'),
  };

  return <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};