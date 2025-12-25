"use client";

import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Account({ onNavigate, onOpenSetting }: { onNavigate?: (label: string) => void; onOpenSetting: () => void }) {

    const { user, signOut } = useContext(AuthContext);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        removeEventListener
        const handleClickOutside = (event: MouseEvent) => {
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // close menu on navigation
    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [pathname]);

    const handleSignOut = () => {
        signOut();
        setIsUserMenuOpen(false);
        router.refresh()
    };

    const initials = (() => {
        const name = user?.name || user?.email || '';
        return name ? name.substring(0, 2).toUpperCase() : 'U';
    })();

    return (
        <div className="relative" ref={userRef}>
            <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:shadow-lg transition-all"
            >
                {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user?.name || 'avatar'} className="w-full h-full object-cover rounded-full" />
                ) : (
                    <span>{initials}</span>
                )}
            </div>

            {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-white/5">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ''}</p>
                        <p className="text-xs text-brand-purple mt-1">{(user as any)?.username || ''}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => {
                                setIsUserMenuOpen(false);
                                if (onNavigate) {
                                    onNavigate('Profile');
                                } else {
                                        try {
                                            router.push('/app?pane=profile');
                                        } catch (e) {
                                            window.location.href = '/app?pane=profile';
                                        }
                                }
                            }}
                            className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <UserIcon size={16} />
                            Profile
                        </button>
                        <button
                            onClick={() => { setIsUserMenuOpen(false); onOpenSetting(); }}
                            className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Settings size={16} />
                            Settings
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={handleSignOut}
                            className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}