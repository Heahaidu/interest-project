'use client';

import { Header } from '@/components/common/LandingHeader';
import { Footer } from '@/components/common/Footer';
import { useEffect, useState } from 'react';
import { User, Theme, Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/common/EventCard2';
import { Modal } from '@/components/common/Modal';
import { FEATURED_EVENTS, REVIEWS } from '@/lib/constants';
import Hero from './Hero';
import DownloadSection from './Download';
import Login from '@/components/common/Login';
import Register from '@/components/common/Register';
import { NextResponse } from 'next/server';

export default function Home() {

  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [events, setEvents] = useState<Event[]>(FEATURED_EVENTS);

  // --- Modals ---
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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

  // --- Handlers ---
  const handleSetTheme = (theme: Theme) => {
    setTheme(theme);
  }

  const handleSubmitReview = () => {
    if (!selectedEvent || !user) return;
    // Mock submission
    setReviewText('');
    setReviewRating(5);
    alert('Review submitted!');
  };

  const toggleInterest = (id: string) => {
    if (!user) {
      setAuthMode('login');
      return;
    }
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isInterested: !e.isInterested } : e));
  };

  // --- RENDER ---

  function renderEventDetailContent() {
    if (!selectedEvent) return null;
    const eventReviews = REVIEWS.filter(r => r.eventId === selectedEvent.id);
    return (
      <div className="relative text-zinc-900 dark:text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        <div className="h-64 w-full relative">
          <img src={selectedEvent.imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-3 border border-white/20">
              {selectedEvent.category}
            </span>
            <h2 className="text-3xl font-bold text-white leading-tight">{selectedEvent.title}</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <div className="font-bold">{selectedEvent.date}</div>
                  <div className="text-zinc-500">{selectedEvent.time}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <div className="font-bold">{selectedEvent.location}</div>
                  <div className="text-zinc-500 text-sm">Get Directions</div>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold mb-2">About Event</h3>
                <p className="text-zinc-500 leading-relaxed">{selectedEvent.description}</p>
              </div>
              {selectedEvent.status === 'ended' && (
                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold mb-4 text-xl">Reviews</h3>
                  {user && (
                    <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <label className="block text-sm font-medium mb-2">Leave a review</label>
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className={`text-lg ${star <= reviewRating ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-600'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="How was the event?"
                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black/50 text-sm mb-2"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button size="sm" onClick={handleSubmitReview}>Submit</Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    {eventReviews.length > 0 ? eventReviews.map(review => (
                      <div key={review.id} className="flex gap-4">
                        <img src={review.userAvatar} alt="" className="w-10 h-10 rounded-full bg-zinc-100" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{review.userName}</span>
                            <span className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}</span>
                          </div>
                          <p className="text-zinc-500 text-sm mt-1">{review.comment}</p>
                          <div className="text-xs text-zinc-400 mt-1">{review.createdAt}</div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-zinc-500 text-sm">No reviews yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="w-full md:w-72 space-y-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3 mb-4">
                  <img src={selectedEvent.organizer.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                  <div>
                    <div className="text-xs text-zinc-500">Hosted by</div>
                    <div className="font-bold text-sm">{selectedEvent.organizer.name}</div>
                  </div>
                </div>
                {selectedEvent.status === 'ended' ? (
                  <Button disabled className="w-full">Event Ended</Button>
                ) : selectedEvent.status === 'full' ? (
                  <Button disabled className="w-full bg-red-500/10 text-red-500 border-red-500/20">Sold Out</Button>
                ) : (
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Register - {selectedEvent.price}</Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => toggleInterest(selectedEvent.id)}>
                  {selectedEvent.isInterested ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" className="flex-1">Share</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Common components for Modal
  const eventDetailContent = renderEventDetailContent();


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
            {events.slice(0, 3).map(event => (
              <EventCard
                key={event.id}
                event={event}
                viewMode="grid"
                onInterestToggle={toggleInterest}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        </div>

        <DownloadSection />
      </main>

      <Footer setTheme={handleSetTheme} theme={theme} />

      <Modal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)}>
        {Login()}
      </Modal>

      <Modal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)}>
        {Register()}
      </Modal>

      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} size="lg">
        {selectedEvent && eventDetailContent}
      </Modal>
    </div>
  );
}