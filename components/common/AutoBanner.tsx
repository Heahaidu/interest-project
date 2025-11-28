import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Event } from '@/lib/types';

interface AutoBannerProps {
  events: Event[];
}

export default function AutoBanner({events}:AutoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = events.slice(0, 5); // Take first 5 as featured

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const currentEvent = featured[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featured.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-sm overflow-hidden mb-8 group shadow-xl">
      {/* Background Image */}
      <img 
        src={currentEvent.imageUrl} 
        alt={currentEvent.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
          {currentEvent.title}
        </h2>
        <div className="flex items-center gap-4 text-gray-200 text-sm font-medium">
          <span className="flex items-center gap-1">
             <Calendar size={16} /> {currentEvent.date}
          </span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{currentEvent.location}</span>
        </div>
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {featured.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`cursor-pointer w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-10' : 'bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
};