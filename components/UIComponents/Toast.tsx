'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Toast as ToastType } from '../../types';

export const ToastContainer: React.FC<{ toasts: ToastType[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-xs">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastType, onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const displayDuration = toast.duration || 5000; 
    const timer = setTimeout(onClose, displayDuration);
    
    return () => clearTimeout(timer);
  }, [onClose, toast.duration]);

  const styles = {
    success: 'bg-white border-green-100 text-green-800 shadow-green-100/50',
    error: 'bg-white border-red-100 text-red-800 shadow-red-100/50',
    info: 'bg-white border-indigo-100 text-indigo-800 shadow-indigo-100/50'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />
  };

  return (
    <div 
      className={`
        pointer-events-auto flex items-center p-4 rounded-2xl shadow-xl border 
        animate-in slide-in-from-right-full fade-in duration-500
        ${styles[toast.type]}
      `}
    >
      <div className="mr-3 shrink-0">
        {icons[toast.type]}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-semibold leading-snug">{toast.message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};