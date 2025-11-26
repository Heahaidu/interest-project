'use client';

import { Compass, Bookmark, User, Footprints, Settings, MessageCircleQuestion, LucideIcon, Heart } from 'lucide-react';
import Link from 'next/link';
import { ElementType, useState } from 'react';

interface NavButtonProps {
  label: string;
  Icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
}

function NavButton({ label, Icon, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${isActive ? 'bg-gray-200/70 dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
        }`}
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function Sidebar({ onNavChange }: { onNavChange?: (label: string) => void }) {
  const [activeNav, setActiveNav] = useState('Discover');

  const navItems = [
    { label: 'Discover', icon: Compass },
    { label: 'Bookmarks', icon: Heart },
    { label: 'Profile', icon: User },
    { label: 'Activity', icon: Footprints },
  ];

  const bottomNavItems = [
    { label: 'Settings', icon: Settings },
    { label: 'Support', icon: MessageCircleQuestion },
  ];

  const handleNavClick = (label: string) => {
    setActiveNav(label);
    onNavChange?.(label);
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 flex flex-col bg-white dark:bg-[#050505] dark:border-white/5 transition-all duration-200">
      <Link href='/' className='p-6 flex gap-2 items-center'>
        <div className='h-8 w-8 logo'>
          <div className='h-2.5 w-2.5' />
        </div>
        <h2 className="text-2xl font-bold text-black dark:text-white">Interest.</h2>
      </Link>

      <div className="px-4 space-y-1 pb-4">
        {navItems.map((item) => (
          <NavButton
            key={item.label}
            label={item.label}
            Icon={item.icon}
            isActive={activeNav === item.label}
            onClick={() => handleNavClick(item.label)}
          />
        ))}
      </div>
      <div className="mx-4 border-t border-gray-200 dark:border-white/20 transition-all duration-200" />
      <div className="px-4 py-4 space-y-1">
        {bottomNavItems.map((item) => (
          <NavButton
            key={item.label}
            label={item.label}
            Icon={item.icon}
            isActive={activeNav === item.label}
            onClick={() => handleNavClick(item.label)}
          />
        ))}
      </div>
    </nav>
  );
}
