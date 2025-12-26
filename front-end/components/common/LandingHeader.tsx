'use client';

import React, { useState, useEffect, useContext } from 'react';
import { NAV_ITEMS } from '../../lib/constants';
import { Button } from '../ui/button';
import { AuthContext } from '@/context/AuthContext';
import Account from '@/app/app/feature/Account';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
    onLogin: () => void;
    onRegister: () => void;
    onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogin, onRegister, onNavigate }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, signOut } = useContext(AuthContext);
    const router = useRouter();
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (item: { label: string, id: string, href: string }) => {
        if (item.id === 'community' || item.id === 'download') {
            onNavigate(item.id);
        } else {
            // Fallback for anchors
            const element = document.querySelector(item.href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-xl py-3' : 'bg-transparent py-5' // border-b border-white/10
            }`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => { onNavigate('landing') }}
                    >
                        <div className="h-8 w-8 logo">
                            <div className="h-2.5 w-2.5"></div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground">interest.</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-foreground/80">
                        <Link href={'/app'}>
                            <button
                                className="text-sm font-medium transition-colors hover:text-foreground cursor-pointer"
                            >
                                Discover
                            </button>
                        </Link>
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item)}
                                className="text-sm font-medium transition-colors hover:text-foreground cursor-pointer"
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        {user ? (
                                            <Account onOpenSetting={() => {}} onNavigate={() => {}} />
                                        ) : (
                                            <>
                                                <button
                                                    onClick={onLogin}
                                                    className="hidden sm:block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                                                >
                                                    Sign in
                                                </button>
                                                <Button className='rounded-full' onClick={onRegister}>
                                                    Sign up
                                                </Button>
                                            </>
                                        )}
                                    </div>
                </div>
            </div>
        </header>
    );
};