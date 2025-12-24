// /app/leaves/page.tsx
'use client';

import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '@/context/Context';
import { Plus, Edit, Trash2, Calendar, FileText } from 'lucide-react';
import { Modal, ConfirmModal, InputGroup, Pagination, SearchableSelect, DatePicker } from '@/components/UIComponents';
import { LeaveRequest } from '@/types';
import { MainLayout } from '@/components/MainLayout';

export default function LeavePage() {
  const data = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({ 
    pegawaiEmail: '', 
    tanggal_mulai: '', 
    tanggal_selesai: '', 
    alasan: '' 
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

  const leaves = data?.leaves || [];
  const totalItems = leaves.length;

  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return leaves.slice(start, start + itemsPerPage);
  }, [leaves, currentPage]);

  const employeeOptions = useMemo(() => {
    return (data?.employees || []).map(emp => ({
      label: `${emp.nama_depan} ${emp.nama_belakang}`,
      subLabel: emp.email,
      value: emp.email
    }));
  }, [data?.employees]);

  const validate = () => {
    const e: Record<string, string> = {};
    const todayStr = new Date().toISOString().split('T')[0];

    if (!form.pegawaiEmail) e.pegawaiEmail = 'Pilih pegawai';
    
    if (!form.tanggal_mulai) {
      e.tanggal_mulai = 'Tgl mulai wajib';
    } else if (!editingId && form.tanggal_mulai < todayStr) {
      e.tanggal_mulai = 'Tgl mulai tidak boleh kurang dari hari ini';
    }

    if (!form.tanggal_selesai) {
      e.tanggal_selesai = 'Tgl selesai wajib';
    } else {
      if (!editingId && form.tanggal_selesai < todayStr) {
        e.tanggal_selesai = 'Tgl selesai tidak boleh kurang dari hari ini';
      } else if (form.tanggal_mulai && form.tanggal_selesai < form.tanggal_mulai) {
        e.tanggal_selesai = 'Tgl selesai tidak boleh kurang dari tgl mulai';
      }
    }

    if (!form.alasan.trim()) e.alasan = 'Alasan harus diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpenModal = (leave?: LeaveRequest) => {
    setErrors({});
    if (leave) {
      setEditingId(leave.id);
      setForm({ 
        pegawaiEmail: leave.pegawaiEmail,
        tanggal_mulai: leave.tanggal_mulai,
        tanggal_selesai: leave.tanggal_selesai,
        alasan: leave.alasan
      });
    } else {
      setEditingId(null);
      setForm({ 
        pegawaiEmail: '', 
        tanggal_mulai: '', 
        tanggal_selesai: '', 
        alasan: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handlePreSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    
    setConfirmConfig({
      open: true,
      title: editingId ? 'Simpan Perubahan?' : 'Ajukan Cuti Baru?',
      message: editingId ? 'Perbarui data cuti ini?' : 'Pengajuan cuti akan didaftarkan ke sistem.',
      type: 'primary',
      onConfirm: async () => {
        if (editingId) {
          await data?.updateLeave(editingId, { ...form });
        } else {
          await data?.addLeave({ ...form });
        }
        setIsModalOpen(false);
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Data Cuti Pegawai</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Log Absensi & Cuti</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" /> Buat Pengajuan
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Pegawai</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Rentang Waktu</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Alasan</th>
                  <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-black text-gray-400">#{leave.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 text-sm">
                        {leave.pegawai ? `${leave.pegawai.nama_depan} ${leave.pegawai.nama_belakang}` : '---'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{leave.pegawaiEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-indigo-400" /> {leave.tanggal_mulai}
                      </div>
                      <div className="text-[10px] text-gray-400 ml-4.5">s/d {leave.tanggal_selesai}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 max-w-[200px] flex items-start gap-1.5">
                        <FileText className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                        <span className="truncate italic">"{leave.alasan}"</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenModal(leave)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmConfig({
                            open: true, 
                            title: 'Hapus Record?', 
                            message: `Hapus record cuti #${leave.id}?`, 
                            type: 'danger',
                            onConfirm: () => data?.deleteLeave(leave.id)
                          })} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedLeaves.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                      Tidak ada data cuti ditemukan
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
          title={editingId ? `Update Data Cuti #${editingId}` : 'Form Pengajuan Cuti'}
        >
          <form onSubmit={handlePreSubmit} className="space-y-4">
            <InputGroup label="Pegawai" error={errors.pegawaiEmail}>
              <SearchableSelect 
                disabled={!!editingId}
                placeholder="Cari nama atau email pegawai..."
                options={employeeOptions}
                value={form.pegawaiEmail}
                onChange={(val) => setForm({...form, pegawaiEmail: val})}
              />
              {editingId && <p className="text-[10px] text-gray-400 mt-1 italic font-medium">* Pegawai tidak dapat diubah pada mode update.</p>}
            </InputGroup>
            
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Tgl Mulai" error={errors.tanggal_mulai}>
                <DatePicker 
                  value={form.tanggal_mulai} 
                  onChange={val => setForm({...form, tanggal_mulai: val})} 
                />
              </InputGroup>
              <InputGroup label="Tgl Selesai" error={errors.tanggal_selesai}>
                <DatePicker 
                  value={form.tanggal_selesai} 
                  onChange={val => setForm({...form, tanggal_selesai: val})} 
                />
              </InputGroup>
            </div>
            
            <InputGroup label="Alasan Cuti" error={errors.alasan}>
              <textarea 
                placeholder="Contoh: Keperluan keluarga, Sakit, dsb." 
                className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none h-24 resize-none transition-all" 
                value={form.alasan} 
                onChange={e => setForm({...form, alasan: e.target.value})} 
              />
            </InputGroup>
            
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95 mt-4 uppercase tracking-widest text-sm"
            >
              {editingId ? 'SIMPAN PERUBAHAN' : 'KIRIM PENGAJUAN'}
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