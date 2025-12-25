'use client';

import { Header } from '@/components/common/LandingHeader';
import { Footer } from '@/components/common/Footer';
import { useContext, useEffect, useState } from 'react';
import { User, Theme, Event } from '@/lib/types';
import { Modal } from '@/components/common/Modal';
import Hero from './Hero';
import DownloadSection from './Download';
import Login from '@/components/common/Login';
import Register from '@/components/common/Register';
import { NextResponse } from 'next/server';
import EventCard from '@/components/shared/EventCard';
import { AuthContext } from '@/context/AuthContext';

export default function Home() {

  // --- State ---
  const { user } = useContext(AuthContext);

  const [theme, setTheme] = useState<Theme>('dark');

  // --- Modals ---
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // --- Effects ---
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: 'light' | 'dark') => {
      if (t === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemDark ? 'dark' : 'light');

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme);
    }
  }, [theme]);


  const handleSubmitReview = () => {
    if (!selectedEvent || !user) return;
    // Mock submission
    setReviewText('');
    setReviewRating(5);
    alert('Review submitted!');
  };

  // const toggleInterest = (id: string) => {
  //   if (!user) {
  //     setAuthMode('login');
  //     return;
  //   }
  //   setEvents(prev => prev.map(e => e.id === id ? { ...e, isInterested: !e.isInterested } : e));
  // };


  return (
    <div id='landing' className="landing-background min-h-screen text-white font-sans selection:bg-indigo-500/30">
      <Header
        onLogin={() => setShowSignInModal(true)}
        onRegister={() => setShowSignUpModal(true)}
        onNavigate={(page) => {
          if (page === 'discover') NextResponse.redirect(new URL('/discover'));
          if (page === 'download') {
            document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }}
      />

      <main>
        <Hero />

        <div id="featured" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Trending Events</h2>
            <button className="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* {events.slice(0, 3).map(event => (
              <EventCard
                key={event.uuid}
                event={event}
                onClick={() => setSelectedEvent(event)}
              />
            ))} */}
          </div>
        </div>

        <DownloadSection />
      </main>

      <Footer />

      <Modal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)}>
        <Login onSuccess={() => setShowSignInModal(false)} />
      </Modal>

      <Modal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)}>
        <Register onSuccess={() => setShowSignUpModal(false)} />
      </Modal>

    </div>
  );
}