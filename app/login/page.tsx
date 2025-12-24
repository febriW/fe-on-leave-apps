'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, AlertCircle, Mail, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) setError('Akses ditolak. Cek kembali email & password.');
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mempersiapkan Sesi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-50 animate-in zoom-in duration-500">
        <div className="text-center mb-12">
          <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 rotate-3">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Admin Portal</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] mt-2 tracking-widest">Employee Management System</p>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-gray-700"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-gray-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white font-black py-4 rounded-2xl shadow-xl transition-all transform uppercase tracking-widest text-sm mt-4 flex items-center justify-center
              ${
                isSubmitting
                  ? 'bg-indigo-400 opacity-70 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-95'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                MEMPROSES...
              </>
            ) : 'Masuk ke Sistem'}
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">© 2025 HRM Admin Panel</p>
        </div>
      </div>
    </div>
  );
}