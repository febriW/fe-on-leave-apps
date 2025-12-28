'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/context/DataContext'; 
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Modal, ConfirmModal, InputGroup, Pagination, DatePicker } from '@/components/UIComponents';
import { Admin, CreateAdminInput } from '@/types';
import { MainLayout } from '@/components/MainLayout';
import { api } from '@/lib/api';

export default function AdminPage() {
  const { addAdmin, updateAdmin, deleteAdmin } = useData();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);

  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    nama_depan: '', 
    nama_belakang: '', 
    tanggal_lahir: '', 
    jenis_kelamin: 'L' as 'L' | 'P' 
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmConfig, setConfirmConfig] = useState<{ 
    open: boolean; 
    onConfirm: () => void; 
    title: string; 
    message: string; 
    type: 'danger' | 'primary' | 'success' 
  }>({
    open: false, onConfirm: () => {}, title: '', message: '', type: 'primary'
  });

  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin?page=${currentPage}&limit=${itemsPerPage}`);
      setAdmins(response.data.data || []);
      setTotalItems(response.data.total || 0);
    } catch (error) {
      console.error("Gagal mengambil data admin:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email tidak valid';
    if (!editingEmail && form.password.length < 6) e.password = 'Password minimal 6 karakter';
    if (!form.nama_depan.trim()) e.nama_depan = 'Nama depan wajib diisi';
    if (!form.nama_belakang.trim()) e.nama_belakang = 'Nama belakang wajib diisi';
    if (!form.tanggal_lahir) e.tanggal_lahir = 'Tanggal lahir wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpenModal = (admin?: Admin) => {
    setErrors({});
    if (admin) {
      setEditingEmail(admin.email);
      setForm({ 
        email: admin.email, 
        password: '', 
        nama_depan: admin.nama_depan, 
        nama_belakang: admin.nama_belakang, 
        tanggal_lahir: admin.tanggal_lahir.split('T')[0], 
        jenis_kelamin: admin.jenis_kelamin 
      });
    } else {
      setEditingEmail(null);
      setForm({ 
        email: '', 
        password: '', 
        nama_depan: '', 
        nama_belakang: '', 
        tanggal_lahir: '', 
        jenis_kelamin: 'L' 
      });
    }
    setIsModalOpen(true);
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setConfirmConfig({
      open: true,
      title: editingEmail ? 'Simpan Perubahan?' : 'Tambah Admin?',
      message: editingEmail ? 'Perbarui data admin ini?' : 'Admin baru akan ditambahkan ke sistem.',
      type: 'primary',
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          if (editingEmail) {
            const updateData: Partial<Admin> = { ...form };
            if (!form.password) delete updateData.password;
            await updateAdmin(editingEmail, updateData);
          } else {
            await addAdmin(form as CreateAdminInput);
          }
          setIsModalOpen(false);
          loadAdmins();
        } catch (error) {
          console.error(error);
        } finally {
          setIsSubmitting(false);
          setConfirmConfig(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleDelete = (email: string) => {
    setConfirmConfig({
      open: true,
      title: 'Hapus Admin?',
      message: `Hapus admin ${email}? Tindakan ini permanen.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteAdmin(email);
          loadAdmins();
        } catch (error) {}
        setConfirmConfig(prev => ({ ...prev, open: false }));
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Manajemen Admin</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hak Akses Sistem (Server-Side)</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Admin
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Gender</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Tgl Lahir</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                   <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                      <p className="mt-2 text-gray-400 font-medium">Memuat data...</p>
                    </td>
                  </tr>
                ) : admins.map(admin => (
                  <tr key={admin.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{admin.nama_depan} {admin.nama_belakang}</td>
                    <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">
                        {admin.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {admin.tanggal_lahir.split('T')[0]}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenModal(admin)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.email)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && admins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                      Tidak ada data admin ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <Pagination 
            currentPage={currentPage} 
            totalItems={totalItems} 
            itemsPerPage={itemsPerPage} 
            onPageChange={setCurrentPage} 
          />
        </div>

        {/* Form Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmail ? 'Update Admin' : 'Admin Baru'}>
          <form onSubmit={handlePreSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Nama Depan" error={errors.nama_depan}>
                <input 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-300 transition-all" 
                  value={form.nama_depan} 
                  onChange={e => setForm({...form, nama_depan: e.target.value})} 
                />
              </InputGroup>
              <InputGroup label="Nama Belakang" error={errors.nama_belakang}>
                <input 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-300 transition-all" 
                  value={form.nama_belakang} 
                  onChange={e => setForm({...form, nama_belakang: e.target.value})} 
                />
              </InputGroup>
            </div>
            <InputGroup label="Email" error={errors.email}>
              <input 
                type="email" 
                disabled={!!editingEmail} 
                className={`w-full p-3 rounded-xl border border-gray-200 ${editingEmail ? 'bg-gray-100 cursor-not-allowed' : 'bg-slate-50 focus:bg-white focus:border-indigo-300'} outline-none transition-all`} 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </InputGroup>
            <InputGroup label={editingEmail ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"} error={errors.password}>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-300 transition-all" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </InputGroup>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Tgl Lahir" error={errors.tanggal_lahir}>
                <DatePicker 
                  value={form.tanggal_lahir} 
                  onChange={val => setForm({...form, tanggal_lahir: val})} 
                />
              </InputGroup>
              <InputGroup label="Jenis Kelamin">
                <select 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-300 transition-all" 
                  value={form.jenis_kelamin} 
                  onChange={e => setForm({...form, jenis_kelamin: e.target.value as 'L' | 'P'})}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </InputGroup>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all active:scale-95 mt-4 uppercase tracking-widest text-sm flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (editingEmail ? 'SIMPAN PERUBAHAN' : 'BUAT ADMIN BARU')}
            </button>
          </form>
        </Modal>

        {/* Global Confirm Modal */}
        <ConfirmModal 
          isOpen={confirmConfig.open} 
          onClose={() => setConfirmConfig({...confirmConfig, open: false})}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          type={confirmConfig.type}
        />
      </div>
    </MainLayout>
  );
}