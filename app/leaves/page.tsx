'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2, Calendar, Loader2, Search, X } from 'lucide-react';
import { Modal, ConfirmModal, InputGroup, Pagination, SearchableSelect, DatePicker } from '@/components/UIComponents';
import { LeaveRequest, CreateLeaveInput } from '@/types';
import { MainLayout } from '@/components/MainLayout';

export default function LeavePage() {
  const { employees, addLeave, updateLeave, deleteLeave, fetchLeaves } = useData();
  const { isAuthenticated } = useAuth();
  const [leavesData, setLeavesData] = useState<LeaveRequest[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    pegawaiEmail: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: ''
  });
  const [confirmConfig, setConfirmConfig] = useState<any>({ open: false });
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const result = await fetchLeaves(currentPage, itemsPerPage, debouncedSearch);
    setLeavesData(result.data);
    setTotalItems(result.total);
    setIsLoading(false);
  }, [currentPage, debouncedSearch, isAuthenticated, fetchLeaves]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (leave: LeaveRequest) => {
    setEditingId(leave.id);
    setForm({
      pegawaiEmail: leave.pegawai?.email || (leave as any).pegawaiEmail || '',
      tanggal_mulai: leave.tanggal_mulai,
      tanggal_selesai: leave.tanggal_selesai,
      alasan: leave.alasan
    });
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
      // Error sudah ditangani oleh toast di context
    } finally {
      setIsSubmitting(false);
    }
  };

  const employeeOptions = useMemo(() => employees.map(emp => ({
    label: `${emp.nama_depan} ${emp.nama_belakang}`,
    subLabel: emp.email,
    value: emp.email
  })), [employees]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header & Search Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Data Cuti Pegawai</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                {debouncedSearch ? 'Hasil Cari' : `${totalItems} Records`}
              </span>
              <p className="text-[11px] text-gray-400 font-bold uppercase italic">
                Page {currentPage} of {Math.ceil(totalItems / itemsPerPage) || 1}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Cari email pegawai..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => { setEditingId(null); setForm({ pegawaiEmail: '', tanggal_mulai: '', tanggal_selesai: '', alasan: '' }); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" /> Buat Pengajuan
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pegawai</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Waktu</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alasan</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-28 text-center">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500 mb-4" />
                      <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Sinkronisasi Server...</p>
                    </td>
                  </tr>
                ) : leavesData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-gray-400 font-black italic text-sm uppercase">
                      Tidak ada riwayat cuti ditemukan
                    </td>
                  </tr>
                ) : (
                  leavesData.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-6 py-6 text-xs font-black text-slate-300">#{leave.id}</td>
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <div className="w-11 h-11 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-gray-900 font-black shadow-sm group-hover:border-indigo-200">
                            {leave.pegawai?.nama_depan?.charAt(0) || '?'}
                          </div>
                          <div className="ml-4 flex flex-col">
                            <span className="font-black text-slate-800 text-sm">
                              {leave.pegawai ? `${leave.pegawai.nama_depan} ${leave.pegawai.nama_belakang}` : 'User'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {leave.pegawai?.email || (leave as any).pegawaiEmail}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="text-[11px] font-black text-slate-700 flex items-center bg-white border border-slate-100 px-2 py-1 rounded-lg w-fit">
                            <Calendar className="w-3 h-3 text-indigo-500 mr-2" /> {leave.tanggal_mulai}
                          </div>
                          <div className="text-[9px] text-slate-400 font-black italic uppercase">Hingga {leave.tanggal_selesai}</div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-xs text-slate-500 font-medium italic line-clamp-2 group-hover:line-clamp-none transition-all">
                          "{leave.alasan}"
                        </p>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100">
                          <button onClick={() => handleEdit(leave)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setConfirmConfig({ 
                              open: true, 
                              title: 'Hapus Record?', 
                              message: `Hapus record cuti #${leave.id}?`, 
                              type: 'danger', 
                              onConfirm: () => onActionComplete(() => deleteLeave(leave.id)) 
                            })} 
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && totalItems > itemsPerPage && !debouncedSearch && (
            <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-end">
              <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>

        {/* Modal & Confirm Modal tetap menggunakan props yang sama */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? `Update #${editingId}` : 'Pengajuan Cuti'}>
          <form onSubmit={(e) => { e.preventDefault(); onActionComplete(() => editingId ? updateLeave(editingId, form) : addLeave(form as CreateLeaveInput)); }} className="space-y-5">
            <InputGroup label="Pegawai">
              <SearchableSelect disabled={!!editingId} options={employeeOptions} value={form.pegawaiEmail} onChange={(val) => setForm({ ...form, pegawaiEmail: val })} />
            </InputGroup>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Mulai"><DatePicker value={form.tanggal_mulai} onChange={val => setForm({ ...form, tanggal_mulai: val })} /></InputGroup>
              <InputGroup label="Selesai"><DatePicker value={form.tanggal_selesai} onChange={val => setForm({ ...form, tanggal_selesai: val })} /></InputGroup>
            </div>
            <InputGroup label="Alasan Cuti">
              <textarea placeholder="Tulis alasan..." className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white h-32 resize-none transition-all text-sm" value={form.alasan} onChange={e => setForm({ ...form, alasan: e.target.value })} />
            </InputGroup>
            <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 disabled:bg-gray-400 transition-all uppercase tracking-widest text-sm flex justify-center items-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingId ? 'Simpan Perubahan' : 'Kirim Pengajuan')}
            </button>
          </form>
        </Modal>

        <ConfirmModal 
          isOpen={confirmConfig.open} 
          onClose={() => setConfirmConfig({ ...confirmConfig, open: false })} 
          onConfirm={confirmConfig.onConfirm} 
          title={confirmConfig.title} 
          message={confirmConfig.message} 
          type={confirmConfig.type} 
        />
      </div>
    </MainLayout>
  );
}