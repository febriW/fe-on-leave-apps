'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, User, Search, X, Calendar as CalendarIcon } from 'lucide-react';

export const InputGroup: React.FC<{ label: string, error?: string, children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    {children}
    {error && <p className="text-[11px] text-red-500 font-medium flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1" />{error}</p>}
  </div>
);

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
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
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
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
              <div 
                key={opt.value}
                className={`px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${value === opt.value ? 'bg-indigo-50' : ''}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(""); }}
              >
                <p className={`text-sm font-bold ${value === opt.value ? 'text-indigo-600' : 'text-gray-700'}`}>{opt.label}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{opt.subLabel}</p>
              </div>
            )) : <div className="p-8 text-center"><p className="text-xs text-gray-400 italic">Data tidak ditemukan</p></div>}
          </div>
        </div>
      )}
    </div>
  );
};