"use client";

import { AuthContext } from "@/context/AuthContext";
import { AppPage } from "@/lib/types";
import {
  Compass,
  Footprints,
  Settings,
  MessageCircleQuestion,
  LucideIcon,
  Heart,
  PlusCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useContext, useState } from "react";

interface NavButtonProps {
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ label, Icon, isActive, onClick }: NavButtonProps) {
  return (
      <button
        onClick={onClick}
        className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
          isActive
            ? "bg-gray-200/70 dark:bg-white/10 text-black dark:text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
        }`}
      >
        <Icon size={20} />
        <span className="text-sm font-medium">{label}</span>
      </button>
  );
}

interface SidebarProps {
  onNavChange?: (label: AppPage) => void;
  active?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onCreateEvent: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  onNavChange,
  active,
  onCreateEvent,
  isMobileOpen = false,
  onCloseMobile,
  onOpenSettings,
}: SidebarProps) {
  const {user} = useContext(AuthContext);
  const [activeNav, setActiveNav] = useState(active ?? "Discover");

  // keep internal state in sync when parent controls active
  if (active && active !== activeNav) {
    setActiveNav(active);
  }
  const navItems = [
    { label: "Discover" as AppPage, icon: Compass },
    { label: "Interest" as AppPage, icon: Heart },
    { label: "Social" as AppPage, icon: Users },
    { label: "Activity" as AppPage, icon: Footprints },
  ];

  const bottomNavItems = [
    { label: "Settings" as AppPage, icon: Settings },
    // { label: "Support" as AppPage, icon: MessageCircleQuestion },
  ];

  const handleNavClick = (label: AppPage) => {
    if (label !== 'Discover' && !user) {
      onOpenSettings();
      return;
    }
    if (label === "Settings") {
      onOpenSettings();
      return;
    }
    if (label === "Support") return;
    setActiveNav(label);
    onNavChange?.(label);
    redirect(`/app/${label.toLocaleLowerCase()}`);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onCloseMobile}
        />
      )}

      <nav
        className={`
      fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 flex flex-col z-50
      bg-white dark:bg-[#050505] dark:border-white/5 transition-all duration-200 
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <Link href="/" className="p-6 flex gap-2 items-center">
          <div className="h-8 w-8 logo">
            <div className="h-2.5 w-2.5" />
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Interest.
          </h2>
        </Link>

        <div className="px-4 space-y-1 pb-4">
          {user && <button
            onClick={() => {
              onCreateEvent();
              if (onCloseMobile) onCloseMobile();
            }}
            className="cursor-pointer w-full mb-6 bg-gray-900 dark:bg-white text-white dark:text-black py-3.5
              rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg 
              hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <PlusCircle size={20} />
            <span>Create Event</span>
          </button>}

          {navItems.map((item) => (
            <NavButton
              key={item.label}
              label={item.label}
              Icon={item.icon}
              isActive={activeNav === item.label}
              onClick={() => {
                handleNavClick(item.label);
                if (onCloseMobile) onCloseMobile();
              }}
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
              onClick={() => {
                handleNavClick(item.label);
                if (onCloseMobile) onCloseMobile();
              }}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
