'use client';

import React from 'react';
import { HelpCircle, Search, ChevronRight, X } from 'lucide-react';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportDialog({ isOpen, onClose }: SupportDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
       <div className="bg-white dark:bg-[#121212] w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
         <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white">
           <X size={20} />
         </button>
         <div className="flex flex-col items-center text-center mb-6">
           <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
             <HelpCircle size={24} />
           </div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white">How can we help?</h3>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Search our knowledge base or contact support.</p>
         </div>
         <div className="relative mb-6">
           <Search className="absolute left-3 top-3 text-gray-400" size={18} />
           <input type="text" placeholder="Search for answers..." className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
         </div>
         <div className="space-y-3">
           <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left text-sm text-gray-700 dark:text-gray-300">
             <span>I can't find my tickets</span>
             <ChevronRight size={16} className="text-gray-400" />
           </button>
           <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left text-sm text-gray-700 dark:text-gray-300">
             <span>How to refund an event?</span>
             <ChevronRight size={16} className="text-gray-400" />
           </button>
           <button className="w-full mt-4 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">Contact Support Team</button>
         </div>
       </div>
    </div>
  );
}

