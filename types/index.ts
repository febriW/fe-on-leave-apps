export type Role = 'ADMIN';

export interface Admin {
  email: string;
  nama_depan: string;
  nama_belakang: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  email: string;
  nama_depan: string;
  nama_belakang: string;
  no_hp: string;
  alamat: string;
  jenis_kelamin: 'L' | 'P';
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  alasan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  pegawaiEmail: string;
  pegawai?: Employee;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWithLeaves extends Employee {
  leaves: LeaveRequest[];
}

// Payload dari JWT Token
export interface AuthUser {
  email: string;
  nama_depan: string;
  sub?: string;
  role?: Role;
}

// Toast Notification
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export type CreateAdminInput = Omit<Admin, 'created_at' | 'updated_at'>;
export type CreateEmployeeInput = Omit<Employee, 'created_at' | 'updated_at'>;
export type CreateLeaveInput = Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>;