'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { Event } from '@/lib/types';

interface FeaturedCarouselProps {
  events: Event[];
}

export default function FeaturedCarousel({ events }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = events.slice(0, 5); 

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const currentEvent = featured[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featured.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);

  return (
    <div className="relative w-full h-[400px] md:h-[450px] rounded-3xl overflow-hidden mb-12 group shadow-2xl shadow-black/20">
      {/* Background Image with Zoom Effect */}
      <div className="absolute inset-0 bg-black">
         <img 
            key={currentEvent.uuid}
            src={currentEvent.imageUrl} 
            alt={currentEvent.title} 
            className="w-full h-full object-cover opacity-80 animate-in fade-in duration-700 scale-105"
         />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-3/4 flex flex-col items-start gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold text-white uppercase tracking-widest">Featured Event</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] drop-shadow-lg max-w-2xl line-clamp-2">
          {currentEvent.title}
        </h2>
        
        <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base font-medium mt-2">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
             <Calendar size={18} className="text-brand-purple" /> 
             <span>{currentEvent.startTime || ''}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
             <MapPin size={18} className="text-brand-purple" />
             <span>{currentEvent.location}</span>
          </div>
        </div>
        
        <button className="mt-4 bg-white text-black px-8 py-3.5 rounded-full font-bold hover:bg-brand-purple hover:text-white transition-all duration-300 transform hover:scale-105 shadow-xl">
            View Details
        </button>
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 right-12 flex gap-3 z-20">
          <button 
            onClick={prevSlide}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute top-8 right-8 flex gap-2">
        {featured.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-4'}`}
          />
        ))}
      </div>
    </div>
  );
}

