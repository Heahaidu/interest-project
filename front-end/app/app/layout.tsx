'use client'

import dynamic from 'next/dynamic';

const AppLayoutContent = dynamic(() => import('./AppLayoutContent'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#050505]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 dark:border-white" />
    </div>
  ),
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}