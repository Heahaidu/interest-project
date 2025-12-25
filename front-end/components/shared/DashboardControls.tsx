'use client';

import React from 'react';
import { Search, Calendar, List, Grid, Sparkles } from 'lucide-react';
import { ViewMode, DateFilter } from '@/lib/types';

interface DashboardControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onSearch: (term: string) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
}

export default function DashboardControls({ 
  viewMode, 
  setViewMode, 
  onSearch, 
  dateFilter,
  setDateFilter
}: DashboardControlsProps) {
  
  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateFilter({ ...dateFilter, [field]: value, isAuto: false });
  };

  const toggleAuto = () => {
    setDateFilter({ ...dateFilter, isAuto: !dateFilter.isAuto });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center mb-8">
      {/* Search Bar */}
      <div className="relative w-full xl:max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search events..." 
          className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-purple outline-none transition-all"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
        {/* Date Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1">
          <button 
            onClick={toggleAuto}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              dateFilter.isAuto 
                ? 'bg-brand-purple text-white shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-400'
            }`}
          >
            <Sparkles size={14} />
            <span>Auto</span>
          </button>
          
          {!dateFilter.isAuto && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-right-2 duration-200">
               <div className="relative">
                 <input 
                   type="date" 
                   value={dateFilter.start}
                   onChange={(e) => handleDateChange('start', e.target.value)}
                   className="w-28 sm:w-auto pl-2 pr-1 py-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
                 />
               </div>
               <span className="text-gray-400">-</span>
               <div className="relative">
                 <input 
                   type="date" 
                   value={dateFilter.end}
                   onChange={(e) => handleDateChange('end', e.target.value)}
                   className="w-28 sm:w-auto pl-2 pr-1 py-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
                 />
               </div>
            </div>
          )}
          {dateFilter.isAuto && (
             <div className="hidden sm:block text-xs text-gray-400 px-3">
                Smart date matching
             </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/5 ml-auto sm:ml-0">
          <button 
            onClick={() => setViewMode('list')} 
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm dark:bg-[#1a1a1a] text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <List size={18} />
          </button>
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm dark:bg-[#1a1a1a] text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

