import React, { useState } from 'react';
import { ArrowRight, Search, Loader2, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {

    return (
        <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4 pt-20 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                    Discover events that <br/> spark your <span className="text-indigo-400">interest.</span>
                </h1>

                <p className="mt-6 leading-6 text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mb-10 font-light transition-colors">
                    The world's most curated event platform. Find workshops, conferences, and social gatherings happening near you today.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-12">
                    <Button className='bg-black text-white dark:bg-white dark:text-black px-8 py-6 rounded-full font-bold text-base hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors w-full sm:w-auto min-w-[160px]'
                    >
                        Explore Events
                    </Button>
                    <button className="cursor-pointer text-gray-900 dark:text-white flex items-center gap-2 font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-6 py-4">
                        View Featured <ArrowRight size={18} />
                    </button>
                </div>

                <form className="relative w-full max-w-lg group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ask AI: Find tech meetups in Ho Chi Minh City..."
                        className="w-full bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm shadow-sm dark:shadow-none"
                    />
                </form>
            </div>
        </section>
    );
};