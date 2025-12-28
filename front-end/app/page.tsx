'use client';

import { Header } from '@/components/common/LandingHeader';
import { Footer } from '@/components/common/Footer';
import { useContext, useState } from 'react';
import { Event } from '@/lib/types';
import Hero from './Hero';
import DownloadSection from './Download';
import AuthModal from '@/components/common/AuthModal';
import { NextResponse } from 'next/server';
import { AuthContext } from '@/context/AuthContext';
import Modal from '@/components/common/Modal';

export default function Home() {
  const { user } = useContext(AuthContext);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const handleSubmitReview = () => {
    if (!selectedEvent || !user) return;
    setReviewText('');
    setReviewRating(5);
    alert('Review submitted!');
  };

  return (
    <div id='landing' className="landing-background min-h-screen text-white font-sans selection:bg-indigo-500/30">
      <Header
        onLogin={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onRegister={() => {
          setAuthMode('register');
          setShowAuthModal(true);
        }}
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
            <button className="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Event cards */}
          </div>
        </div>

        <DownloadSection />
      </main>

      <Footer />

      <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}>
        <AuthModal
          initialMode={authMode}
          onSuccess={() => setShowAuthModal(false)}
        />
      </Modal>
    </div>
  );
}