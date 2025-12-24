'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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