'use client';

import React, { useContext } from 'react';
import { DataContext } from '@/context/Context';
import { Users, ShieldCheck, CalendarDays, ClipboardList, LayoutDashboard } from 'lucide-react';
import { MainLayout } from '@/components/MainLayout';

export default function DashboardPage() {
  const data = useContext(DataContext);
  
  const totalEmployees = data?.employees.length || 0;
  const totalLeaves = data?.leaves.length || 0;
  const totalAdmins = data?.admins.length || 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Pegawai', val: totalEmployees, icon: <Users className="w-6 h-6" />, color: 'bg-blue-600' },
            { label: 'Total Admin', val: totalAdmins, icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-indigo-600' },
            { label: 'Total Pengajuan Cuti', val: totalLeaves, icon: <CalendarDays className="w-6 h-6" />, color: 'bg-purple-600' },
            { label: 'Log Aktivitas', val: totalLeaves + totalEmployees, icon: <ClipboardList className="w-6 h-6" />, color: 'bg-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>{stat.icon}</div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-2xl font-black text-gray-800">{stat.val}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-8 flex items-center text-gray-800">
              <LayoutDashboard className="w-5 h-5 mr-3 text-indigo-600" /> Ringkasan Pegawai Terbaru
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[11px] font-bold text-gray-400 uppercase px-2">Pegawai</th>
                    <th className="pb-4 text-[11px] font-bold text-gray-400 uppercase px-2">No. HP</th>
                    <th className="pb-4 text-[11px] font-bold text-gray-400 uppercase px-2 text-right">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.employees.slice(-5).reverse().map(emp => (
                    <tr key={emp.email} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mr-3">{emp.nama_depan.charAt(0)}</div>
                          <span className="font-bold text-gray-700 text-sm">{emp.nama_depan} {emp.nama_belakang}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-500 font-medium">{emp.no_hp}</td>
                      <td className="py-4 px-2 text-right text-xs font-bold text-gray-400">{emp.created_at.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-8 flex items-center text-gray-800">Cuti Terakhir</h2>
            <div className="space-y-4">
              {totalLeaves === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400 text-sm font-medium italic">Tidak ada data cuti</p>
                </div>
              ) : (
                data?.leaves.slice(0, 5).map(leave => (
                  <div key={leave.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-800 text-sm">{leave.pegawai?.nama_depan} {leave.pegawai?.nama_belakang}</p>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">ID: #{leave.id}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 italic">"{leave.alasan}"</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-2">{leave.tanggal_mulai} s/d {leave.tanggal_selesai}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}