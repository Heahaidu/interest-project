'use client';

import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Footer() {
    const { theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return (
        <footer className="border-t border-gray-200 dark:border-white/5 py-6 mt-auto transition-colors duration-300 transition-all">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 px-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white">interest.</span>
                    <span className="hidden lg:inline text-gray-300 dark:text-gray-700">•</span>
                    <span className="hidden lg:inline">Designed by Heahaidu</span>
                </div>

                {mounted && <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Theme</span>
                    <div className="toggle">
                        <button
                            onClick={() => setTheme('light')}
                            className={`cursor-pointer ${theme === 'light' ? 'bg-white !text-foreground' : ''}`}
                            title="Light Mode"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`cursor-pointer ${theme === 'dark' ? 'bg-white !text-black' : ''}`}
                            title="Dark Mode"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        </button>
                        <button
                            onClick={() => setTheme('system')}
                            className={`cursor-pointer ${theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'bg-white !text-black' : 'bg-white !text-foreground' : ''} `}
                            title="System Mode"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="12" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                        </button>
                    </div>
                </div>}
            </div>
        </footer>
    )
}