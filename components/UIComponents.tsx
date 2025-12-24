'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { X, AlertCircle, Trash2, CheckCircle2, ChevronLeft, ChevronRight, Info, Search, User, Calendar as CalendarIcon } from 'lucide-react';
import { Toast as ToastType } from '../types';

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

export const InputGroup: React.FC<{ label: string, error?: string, children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    {children}
    {error && <p className="text-[11px] text-red-500 font-medium flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1" />{error}</p>}
  </div>
);

/**
 * CUSTOM DATEPICKER COMPONENT
 */
export const DatePicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ value, onChange, disabled = false, placeholder = "Pilih Tanggal" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [viewDate]);

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${year}-${month}-${dayStr}`);
    setIsOpen(false);
  };

  const selectToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${dayStr}`;
    onChange(todayStr);
    setViewDate(now);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const isSelected = (day: number | null) => {
    if (!day || !value) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return today.getDate() === day && today.getMonth() === viewDate.getMonth() && today.getFullYear() === viewDate.getFullYear();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-3 pl-10 rounded-xl border border-gray-200 transition-all cursor-pointer flex items-center ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-slate-50 hover:bg-white active:ring-4 active:ring-indigo-50'}`}
      >
        <CalendarIcon className={`absolute left-3 w-4 h-4 ${disabled ? 'text-gray-300' : 'text-indigo-400'}`} />
        <span className={`text-sm font-medium ${!value ? 'text-gray-400' : 'text-gray-700'}`}>
          {value ? value : placeholder}
        </span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] p-4 w-72 animate-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            <div className="text-sm font-black text-gray-800 uppercase tracking-tighter">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button type="button" onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="text-[10px] font-black text-gray-400 uppercase">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, i) => (
              <div key={i} className="aspect-square">
                {day && (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`w-full h-full flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isSelected(day) 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                        : isToday(day)
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
            <button 
              type="button"
              onClick={selectToday}
              className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase"
            >
              Ke Hari Ini
            </button>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const SearchableSelect: React.FC<{
  options: { label: string; subLabel: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ options, value, onChange, placeholder = "Cari data...", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-3 pl-10 pr-10 rounded-xl border border-gray-200 transition-all cursor-pointer flex items-center justify-between ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-slate-50 hover:bg-white active:ring-4 active:ring-indigo-50'}`}
      >
        <User className={`absolute left-3 w-4 h-4 ${disabled ? 'text-gray-400' : 'text-indigo-400'}`} />
        <span className={`text-sm truncate font-medium ${!selectedOption ? 'text-gray-400' : 'text-gray-700'}`}>
          {selectedOption ? `${selectedOption.label} (${selectedOption.subLabel})` : placeholder}
        </span>
        <Search className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-60">
          <div className="p-3 border-b border-gray-50 flex items-center bg-slate-50/50 sticky top-0">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
            <input 
              autoFocus
              className="bg-transparent text-sm w-full outline-none font-medium text-gray-700"
              placeholder="Ketik untuk mencari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <X 
                className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }} 
              />
            )}
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value}
                  className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${value === opt.value ? 'bg-indigo-50' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <p className={`text-sm font-bold ${value === opt.value ? 'text-indigo-600' : 'text-gray-700'}`}>{opt.label}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{opt.subLabel}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 italic">Pegawai tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Pagination: React.FC<{
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Showing <span className="text-gray-800">{startIdx}</span> to <span className="text-gray-800">{endIdx}</span> of <span className="text-gray-800">{totalItems}</span> entries
      </p>
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
              currentPage === i + 1 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                : 'text-gray-500 hover:bg-slate-50 border border-transparent hover:border-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

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