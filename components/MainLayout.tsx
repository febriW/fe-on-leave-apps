'use client';

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, ShieldCheck, CalendarDays, UserPlus, 
  LogOut, Menu, Briefcase 
} from 'lucide-react';
import { AuthContext } from '@/context/Context';

const SidebarLink: React.FC<{ href: string, icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }> = ({ href, icon, label, active, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </Link>
);

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // PROTEKSI: Jika loading selesai dan TIDAK terautentikasi (token tidak ada), lempar ke login
    if (!auth?.isLoading && !auth?.isAuthenticated) {
      router.push('/login');
    }
  }, [auth?.isAuthenticated, auth?.isLoading, router]);

  // 1. Tampilkan loading screen saat aplikasi mengecek localStorage/token
  if (auth?.isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Memeriksa Sesi...</p>
      </div>
    );
  }

  // 2. Jika tidak terautentikasi, jangan render apa pun agar tidak flicker sebelum redirect
  if (!auth?.isAuthenticated) return null;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Ambil inisial dari email (karena kita tidak punya data nama lengkap)
  const displayEmail = auth?.user?.email || 'Admin';
  const initial = displayEmail.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center space-x-3 text-indigo-600 font-black text-2xl mb-12">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Briefcase className="w-6 h-6" />
            </div>
            <span>AdminHRM</span>
          </div>
          
          <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3">Main</div>
            <SidebarLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setIsSidebarOpen(false)} />
            
            <div className="pt-6 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3">Master Data</div>
            <SidebarLink href="/admins" icon={<ShieldCheck className="w-5 h-5" />} label="Data Admin" active={pathname === '/admins'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink href="/employees" icon={<Users className="w-5 h-5" />} label="Data Pegawai" active={pathname === '/employees'} onClick={() => setIsSidebarOpen(false)} />
            
            <div className="pt-6 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3">Laporan</div>
            <SidebarLink href="/leaves" icon={<CalendarDays className="w-5 h-5" />} label="Daftar Cuti" active={pathname === '/leaves'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink href="/summary" icon={<UserPlus className="w-5 h-5" />} label="Detail Pegawai" active={pathname === '/summary'} onClick={() => setIsSidebarOpen(false)} />
          </nav>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <div className="flex items-center space-x-3 mb-6 bg-slate-50 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                {/* Menampilkan email sebagai identitas utama */}
                <p className="text-sm font-bold text-gray-800 truncate">{displayEmail}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase">Administrator</p>
              </div>
            </div>
            <button 
              onClick={() => auth?.logout()} 
              className="w-full flex items-center justify-center space-x-2 p-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm active:scale-95 group"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 mr-4 hover:bg-gray-100 rounded-xl lg:hidden transition-colors">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold text-gray-800">Sistem Manajemen Cuti</h2>
              <p className="text-[10px] text-gray-400 font-medium">Monitoring Aktivitas Pegawai</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-gray-400">SERVER ACTIVE</span>
             </div>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};