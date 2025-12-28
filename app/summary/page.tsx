'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pagination } from '@/components/UIComponents';
import { MainLayout } from '@/components/MainLayout';
import { Loader2, Users } from 'lucide-react';
import { EmployeeSummaryRow } from '@/components/EmployeeSummaryRow';
import { Employee } from '@/types';
import { useData } from '@/context/DataContext';

export default function SummaryPage() {
  const { fetchEmployees } = useData();
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadEmployees = useCallback(async () => {
      setIsLoading(true);
      try {
        const response = await fetchEmployees(currentPage, itemsPerPage);
        setEmployeesData(response.data);
        setTotalItems(response.total);
      } catch (error) {
        console.error("Failed to load employees", error);
      } finally {
        setIsLoading(false);
      }
    }, [currentPage, fetchEmployees]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800">Detail & Riwayat Pegawai</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-wider">
              Total {totalItems} Pegawai Terdaftar
            </span>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider italic">
              Laporan Akumulasi Cuti
            </p>
          </div>
        </div>
        {/* List Pegawai Section */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500 mb-4" />
              <p className="text-gray-400 font-bold italic text-sm">Memuat data pegawai...</p>
            </div>
          ) : (
            <>
              {employeesData.map(emp => (
                <EmployeeSummaryRow key={emp.email} employee={emp} />
              ))}

              {employeesData.length === 0 && (
                <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-gray-400 font-black italic text-sm uppercase tracking-widest">
                    Belum ada data pegawai untuk ditampilkan
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination Footer */}
        {!isLoading && totalItems > itemsPerPage && (
          <div className="bg-white rounded-3xl border border-gray-100 mt-4 shadow-sm p-4 flex justify-center sm:justify-end">
            <Pagination 
              currentPage={currentPage} 
              totalItems={totalItems} 
              itemsPerPage={itemsPerPage} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}