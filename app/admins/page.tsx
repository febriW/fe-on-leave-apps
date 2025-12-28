'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '@/context/DataContext'; 
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Modal, ConfirmModal, InputGroup, Pagination, DatePicker } from '@/components/UIComponents';
import { Admin, CreateAdminInput } from '@/types';
import { MainLayout } from '@/components/MainLayout';

export default function AdminPage() {
  const { addAdmin, updateAdmin, deleteAdmin, fetchAdmins } = useData();
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
  const [confirmConfig, setConfirmConfig] = useState<any>({ open: false });
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchAdmins(currentPage, itemsPerPage);
    setAdmins(result.data);
    setTotalItems(result.total);
    setIsLoading(false);
  }, [currentPage, fetchAdmins]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setForm({ email: '', password: '', nama_depan: '', nama_belakang: '', tanggal_lahir: '', jenis_kelamin: 'L' });
    }
    setIsModalOpen(true);
  };

  const onActionComplete = async (action: () => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await action();
      setIsModalOpen(false);
      setConfirmConfig({ open: false });
      loadData();
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Manajemen Admin</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Akses Kontrol Panel</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Admin
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                   <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                      <p className="text-gray-400 text-xs font-bold uppercase">Menghubungkan ke Server...</p>
                    </td>
                  </tr>
                ) : admins.map(admin => (
                  <tr key={admin.email} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-800">{admin.nama_depan} {admin.nama_belakang}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        {admin.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • {admin.tanggal_lahir.split('T')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-medium">{admin.email}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(admin)} className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmConfig({
                            open: true,
                            title: 'Hapus Admin?',
                            message: `Hapus admin ${admin.email}?`,
                            type: 'danger',
                            onConfirm: () => onActionComplete(() => deleteAdmin(admin.email))
                          })} 
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!isLoading && totalItems > itemsPerPage && (
            <div className="p-4 bg-slate-50/30 border-t border-gray-100 flex justify-end">
              <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmail ? 'Update Data Admin' : 'Registrasi Admin'}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!validate()) return;
              onActionComplete(() => editingEmail ? updateAdmin(editingEmail, form) : addAdmin(form as CreateAdminInput));
            }} 
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Nama Depan" error={errors.nama_depan}>
                <input className="w-full p-3.5 rounded-2xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-400 transition-all text-sm" value={form.nama_depan} onChange={e => setForm({...form, nama_depan: e.target.value})} />
              </InputGroup>
              <InputGroup label="Nama Belakang" error={errors.nama_belakang}>
                <input className="w-full p-3.5 rounded-2xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-400 transition-all text-sm" value={form.nama_belakang} onChange={e => setForm({...form, nama_belakang: e.target.value})} />
              </InputGroup>
            </div>
            <InputGroup label="Email" error={errors.email}>
              <input type="email" disabled={!!editingEmail} className={`w-full p-3.5 rounded-2xl border border-gray-200 ${editingEmail ? 'bg-gray-100 opacity-60' : 'bg-slate-50 focus:bg-white focus:border-indigo-400'} outline-none transition-all text-sm`} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </InputGroup>
            <InputGroup label={editingEmail ? "Password Baru (Opsional)" : "Password"} error={errors.password}>
              <input type="password" placeholder="••••••••" className="w-full p-3.5 rounded-2xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-400 transition-all text-sm" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </InputGroup>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Tgl Lahir" error={errors.tanggal_lahir}>
                <DatePicker value={form.tanggal_lahir} onChange={val => setForm({...form, tanggal_lahir: val})} />
              </InputGroup>
              <InputGroup label="Jenis Kelamin">
                <select className="w-full p-3.5 rounded-2xl border border-gray-200 bg-slate-50 outline-none focus:bg-white focus:border-indigo-400 transition-all text-sm appearance-none" value={form.jenis_kelamin} onChange={e => setForm({...form, jenis_kelamin: e.target.value as 'L' | 'P'})}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </InputGroup>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-all active:scale-95 mt-4 uppercase tracking-widest text-xs flex justify-center items-center">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (editingEmail ? 'Simpan Perubahan' : 'Daftarkan Admin')}
            </button>
          </form>
        </Modal>

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