import { Theme } from '@/lib/types';
import React from 'react';

interface FooterProps {
  theme?: Theme;
  setTheme: (theme: Theme) => void;
}

export const Footer: React.FC<FooterProps> = ({ theme, setTheme }) => {

  return (
    <footer className="border-t bg-background pb-12 pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold leading-6 text-foreground">Product</h3>
            <ul role="list" className="mt-6 space-y-4">
              <li><a href="#" className="text-sm leading-6 text-zinc-400">Features</a></li>
              <li><a href="#" className="text-sm leading-6 text-zinc-400">Pricing</a></li>
              <li><a href="#download" className="text-sm leading-6 text-zinc-400">Download</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6 text-foreground">Company</h3>
            <ul role="list" className="mt-6 space-y-4">
              <li><a href="#" className="text-sm leading-6 text-zinc-400">About</a></li>
              <li><a href="#" className="text-sm leading-6 text-zinc-400">Careers</a></li>
              <li><a href="#" className="text-sm leading-6 text-zinc-400">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6 text-foreground">Resources</h3>
            <ul role="list" className="mt-6 space-y-4">
              <li><a href="#" className="text-sm leading-6 text-zinc-400">Help Center</a></li>
              <li><a href="#" className="text-sm leading-6 text-zinc-400">Community</a></li>
              <li><a href="#" className="text-sm leading-6 text-zinc-400">Terms</a></li>
            </ul>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="logo h-5 w-5">
                  <div className="h-1.5 w-1.5"></div>
                </div>
                <span className="text-lg font-bold text-foreground">interest.</span>
              </div>
              <p className="text-sm leading-6 text-zinc-500 mb-6">
                Designed by Heahaidu
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-medium">Theme</span>
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};