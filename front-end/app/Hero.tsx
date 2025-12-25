'use client';

import React, { useState } from 'react';
import { ArrowRight, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroProps {
  onSearch?: (term: string) => void;
  isGenerating?: boolean;
}

export default function Hero({ onSearch, isGenerating = false }: HeroProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm);
    } else {
      router.push('/app');
    }
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4 pt-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-gray-900 dark:text-white transition-colors">
          Discover events that <br className="hidden md:block" />
          spark your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">interest.</span>
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-light transition-colors">
          The world's most curated event platform. Find workshops, conferences, and social gatherings happening near you today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-12">
          <button 
            onClick={() => router.push('/app')}
            className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-full font-bold text-base hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full sm:w-auto min-w-[160px]"
          >
            Explore Events
          </button>
          
          <button 
            onClick={() => {
              const downloadSection = document.getElementById('download');
              downloadSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-gray-900 dark:text-white flex items-center gap-2 font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-6 py-4"
          >
            View Featured <ArrowRight size={18} />
          </button>
        </div>

        {/* AI Search Input */}
        <form onSubmit={handleSearch} className="relative w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isGenerating ? (
              <Loader2 className="animate-spin text-purple-500" size={20} />
            ) : (
              <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" size={20} />
            )}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ask AI: Find tech meetups in San Francisco..."
            className="w-full bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm shadow-sm dark:shadow-none"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
             <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/20 px-2 py-1 rounded border border-gray-200 dark:border-white/5">AI Powered</span>
          </div>
        </form>
      </div>
    </section>
  );
}