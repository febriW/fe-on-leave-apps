'use client';

import { useEffect, useState } from 'react';
import { Employee, LeaveRequest } from '@/types';
import { useData } from '@/context/DataContext';
import { Calendar, Loader2, Info } from 'lucide-react';

export const EmployeeSummaryRow = ({ employee }: { employee: Employee }) => {
  const { fetchLeaves } = useData();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEmployeeLeaves = async () => {
      if (!employee.email) return;
      
      setIsLoading(true);
      try {
        const result = await fetchLeaves(1, 50, employee.email);
        setLeaves(result.data);
      } catch (error) {
        console.error("Gagal mengambil cuti untuk:", employee.email, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployeeLeaves();
  }, [employee.email, fetchLeaves]);

  return (
    <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      {/* Profil Pegawai */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-dashed border-gray-100 pb-6 gap-4">
        <div className="flex items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-lg shadow-indigo-100 mr-4 sm:mr-5">
            {employee.nama_depan?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-gray-800 leading-tight">
              {employee.nama_depan} {employee.nama_belakang}
            </h3>
            <div className="flex flex-col mt-1">
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase truncate max-w-[180px] sm:max-w-none">
                {employee.email}
              </span>
              <span className="text-[10px] sm:text-xs font-black text-indigo-500 uppercase tracking-tighter mt-0.5">
                {employee.no_hp}
              </span>
            </div>
          </div>
        </div>
        
        {/* Statistik Ringkas */}
        <div className="bg-indigo-50 px-4 py-2 sm:px-5 sm:py-3 rounded-2xl text-center min-w-[100px] sm:min-w-[120px] self-end sm:self-auto">
          <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Total Cuti</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : leaves.length}
          </p>
        </div>
      </div>
      
      {/* List Riwayat Cuti */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
            <Calendar className="w-3 h-3 mr-2 text-gray-300" /> Riwayat Cuti
          </h4>
          {leaves.length > 3 && (
            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg flex items-center">
              <Info className="w-3 h-3 mr-1" /> Scroll untuk lihat lainnya
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex items-center space-x-2 text-gray-400 italic text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengambil riwayat...</span>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-gray-100">
            <p className="text-sm text-gray-400 italic font-medium">Belum ada catatan riwayat cuti</p>
          </div>
        ) : (
          <div 
            className={`
              pr-2 -mr-2 overflow-y-auto transition-all
              ${leaves.length > 3 ? 'max-h-[380px] sm:max-h-[220px] lg:max-h-[200px]' : 'max-h-full'}
              scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent
            `}
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
              {leaves.map(l => (
                <div 
                  key={l.id} 
                  className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-gray-800 text-[10px] sm:text-xs">{l.tanggal_mulai}</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-slate-50 text-slate-400 border border-slate-100">
                        #{l.id}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px] sm:text-xs font-medium line-clamp-2 leading-relaxed italic mb-3">
                      "{l.alasan}"
                    </p>
                  </div>
                  <div className="pt-2 border-t border-gray-50 text-[9px] font-bold text-indigo-400 text-right uppercase">
                    s/d {l.tanggal_selesai}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};