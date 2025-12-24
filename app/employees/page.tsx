'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Plus, Edit, Trash2, MapPin, Phone, Loader2 } from 'lucide-react';
import { Modal, ConfirmModal, InputGroup, Pagination } from '@/components/UIComponents';
import { Employee, CreateEmployeeInput } from '@/types';
import { MainLayout } from '@/components/MainLayout';

export default function EmployeePage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, isLoadingData } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({ 
    nama_depan: '', 
    nama_belakang: '', 
    email: '', 
    no_hp: '', 
    alamat: '', 
    jenis_kelamin: 'L' as 'L' | 'P' 
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmConfig, setConfirmConfig] = useState<{ 
    open: boolean; 
    onConfirm: () => void; 
    title: string; 
    message: string; 
    type: 'primary' | 'danger' | 'success' 
  }>({
    open: false, onConfirm: () => {}, title: '', message: '', type: 'primary'
  });

  const totalItems = employees.length;

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return employees.slice(start, start + itemsPerPage);
  }, [employees, currentPage]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama_depan.trim()) e.nama_depan = 'Nama depan harus diisi';
    if (!form.nama_belakang.trim()) e.nama_belakang = 'Nama belakang harus diisi';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email tidak valid';
    if (!form.no_hp.trim()) e.no_hp = 'No HP harus diisi';
    if (!form.alamat.trim()) e.alamat = 'Alamat harus diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpenModal = (emp?: Employee) => {
    setErrors({});
    if (emp) {
      setEditingEmail(emp.email);
      setForm({ 
        nama_depan: emp.nama_depan,
        nama_belakang: emp.nama_belakang,
        email: emp.email,
        no_hp: emp.no_hp,
        alamat: emp.alamat,
        jenis_kelamin: emp.jenis_kelamin
      });
    } else {
      setEditingEmail(null);
      setForm({ 
        nama_depan: '', 
        nama_belakang: '', 
        email: '', 
        no_hp: '', 
        alamat: '', 
        jenis_kelamin: 'L' 
      });
    }
    setIsModalOpen(true);
  };

  const handlePreSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    
    setConfirmConfig({
      open: true,
      title: editingEmail ? 'Update Data Pegawai?' : 'Tambah Pegawai?',
      message: 'Apakah Anda yakin ingin menyimpan perubahan data pegawai ini?',
      type: 'primary',
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          if (editingEmail) {
            await updateEmployee(editingEmail, form);
          } else {
            await addEmployee(form as CreateEmployeeInput);
          }
          setIsModalOpen(false);
        } catch (error) {
        } finally {
          setIsSubmitting(false);
          setConfirmConfig(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Data Pegawai</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Database SDM Internal</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Pegawai
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Kontak</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Alamat</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingData ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                      <p className="mt-2 text-gray-400 font-medium">Memuat data pegawai...</p>
                    </td>
                  </tr>
                ) : paginatedEmployees.map(emp => (
                  <tr key={emp.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 text-sm">{emp.nama_depan} {emp.nama_belakang}</div>
                      <div className="text-[10px] text-indigo-500 font-black uppercase">
                        {emp.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-400" /> {emp.no_hp}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 flex items-start gap-1.5 max-w-[200px]">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{emp.alamat}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenModal(emp)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmConfig({
                            open: true, 
                            title: 'Hapus Pegawai?', 
                            message: `Hapus data ${emp.email}? Tindakan ini tidak dapat dibatalkan.`, 
                            type: 'danger',
                            onConfirm: () => deleteEmployee(emp.email)
                          })} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoadingData && paginatedEmployees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                      Tidak ada data pegawai ditemukan
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

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={editingEmail ? 'Edit Data Pegawai' : 'Registrasi Pegawai Baru'}
        >
          <form onSubmit={handlePreSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Nama Depan" error={errors.nama_depan}>
                <input 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none transition-all" 
                  value={form.nama_depan} 
                  onChange={e => setForm({...form, nama_depan: e.target.value})} 
                />
              </InputGroup>
              <InputGroup label="Nama Belakang" error={errors.nama_belakang}>
                <input 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none transition-all" 
                  value={form.nama_belakang} 
                  onChange={e => setForm({...form, nama_belakang: e.target.value})} 
                />
              </InputGroup>
            </div>
            <InputGroup label="Email" error={errors.email}>
              <input 
                type="email" 
                disabled={!!editingEmail} 
                className={`w-full p-3 rounded-xl border border-gray-200 ${editingEmail ? 'bg-gray-100' : 'bg-slate-50 focus:bg-white focus:border-indigo-300'} outline-none transition-all`} 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </InputGroup>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="No. Handphone" error={errors.no_hp}>
                <input 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none transition-all" 
                  placeholder="+62..." 
                  value={form.no_hp} 
                  onChange={e => setForm({...form, no_hp: e.target.value})} 
                />
              </InputGroup>
              <InputGroup label="Jenis Kelamin">
                <select 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none transition-all" 
                  value={form.jenis_kelamin} 
                  onChange={e => setForm({...form, jenis_kelamin: e.target.value as 'L' | 'P'})}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </InputGroup>
            </div>
            <InputGroup label="Alamat Lengkap" error={errors.alamat}>
              <textarea 
                className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none transition-all h-24" 
                value={form.alamat} 
                onChange={e => setForm({...form, alamat: e.target.value})} 
              />
            </InputGroup>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all active:scale-95 mt-4 uppercase tracking-widest text-sm flex justify-center items-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (editingEmail ? 'SIMPAN PERUBAHAN' : 'TAMBAH PEGAWAI')}
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