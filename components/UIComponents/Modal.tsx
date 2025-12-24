'use client';

import React from 'react';
import { X, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden z-50 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
  confirmText?: string;
  type?: 'danger' | 'primary' | 'success';
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Konfirmasi', type = 'primary' }) => {
  if (!isOpen) return null;
  
  const getColors = () => {
    switch(type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-100';
      case 'success': return 'bg-green-600 hover:bg-green-700 shadow-green-100';
      default: return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center z-[61] animate-in zoom-in duration-200">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-50 text-red-600' : type === 'success' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
          {type === 'danger' ? <Trash2 className="w-8 h-8" /> : type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 mb-8 text-sm">{message}</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`flex-1 px-4 py-2 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-95 ${getColors()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};