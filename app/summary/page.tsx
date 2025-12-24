'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { EmployeeWithLeaves } from '@/types';
import { Pagination } from '@/components/UIComponents';
import { MainLayout } from '@/components/MainLayout';
import { Loader2, Calendar } from 'lucide-react';

export default function SummaryPage() {
  const { employees, leaves, isLoadingData } = useData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const allEmployeeData: EmployeeWithLeaves[] = useMemo(() => {
    if (!employees) return [];
    
    return employees.map(emp => {
      const employeeLeaves = leaves.filter(l => {
        const leaveEmail = l.pegawaiEmail || '';
        const empEmail = emp.email || '';
        return leaveEmail.toLowerCase() === empEmail.toLowerCase();
      });

      return {
        ...emp,
        leaves: employeeLeaves
      };
    });
  }, [employees, leaves]);

  const totalItems = allEmployeeData.length;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allEmployeeData.slice(start, start + itemsPerPage);
  }, [allEmployeeData, currentPage]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800">Detail & Riwayat Pegawai</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Laporan Akumulasi Cuti</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {isLoadingData ? (
            <div className="bg-white p-20 rounded-3xl border border-gray-100 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500 mb-4" />
              <p className="text-gray-400 font-medium italic">Memuat data ringkasan...</p>
            </div>
          ) : (
            <>
              {paginatedData.map(emp => (
                <div key={emp.email} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-dashed border-gray-100 pb-6 gap-4">
                    <div className="flex items-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 mr-5">
                        {emp.nama_depan?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-800">{emp.nama_depan} {emp.nama_belakang}</h3>
                        <div className="flex flex-col mt-1">
                          <span className="text-xs font-bold text-gray-400 uppercase">{emp.email}</span>
                          <span className="text-xs font-black text-indigo-500 uppercase tracking-tighter mt-0.5">{emp.no_hp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 px-5 py-3 rounded-2xl text-center min-w-[120px]">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Total Cuti</span>
                      <p className="text-2xl font-black text-indigo-600">{emp.leaves?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                      <Calendar className="w-3 h-3 mr-2 text-gray-300" /> Riwayat Cuti
                    </h4>
                    
                    {!emp.leaves || emp.leaves.length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-2xl text-center border-2 border-dashed border-gray-100">
                        <p className="text-sm text-gray-400 italic font-medium">Belum ada catatan riwayat pengajuan cuti</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {emp.leaves.slice(0, 6).map(l => (
                          <div key={l.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                              <span className="font-black text-gray-800 text-xs">{l.tanggal_mulai}</span>
                              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                                ID: #{l.id}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed h-8 mb-2 italic">
                              "{l.alasan}"
                            </p>
                            <div className="pt-2 border-t border-gray-50 text-[10px] font-bold text-gray-400 text-right uppercase">
                              Hingga {l.tanggal_selesai}
                            </div>
                          </div>
                        ))}
                        {emp.leaves.length > 6 && (
                          <div className="p-5 flex items-center justify-center text-xs font-bold text-gray-400 border border-dashed border-gray-100 rounded-2xl bg-slate-50/50">
                            + {emp.leaves.length - 6} Riwayat Lainnya
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {!isLoadingData && paginatedData.length === 0 && (
                <div className="bg-white p-20 rounded-3xl border border-gray-100 text-center">
                   <p className="text-gray-400 font-medium italic">Tidak ada data pegawai untuk ditampilkan</p>
                </div>
              )}
            </>
          )}
        </div>

        {!isLoadingData && totalItems > itemsPerPage && (
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 mt-4 shadow-sm">
            <Pagination 
              currentPage={currentPage} 
              totalItems={totalItems} 
              itemsPerPage={itemsPerPage} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}