'use client';

import React from 'react';
import { Event, EventCardType } from '@/lib/types';
import { MapPin, Heart, Users } from 'lucide-react';
import { format, formatDate } from 'date-fns';

interface EventCardProps {
  event: Event;
  variant?: EventCardType
  onClick?: () => void;
  onToggleInterest?: (e: React.MouseEvent) => void;
}

export default function EventCard({ event, variant = 'landing', onClick, onToggleInterest }: EventCardProps) {
  const isDashboard = variant === 'app';
  const organizerName = event.organizerName || '';
  const organizerAvatar = event.organizerAvatar || '';
  const isLiked = event.isLiked || event.isInterested || false;

  if (variant === 'chat') {
    return (
      <div
        onClick={onClick}
        className="flex w-full bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-2"
      >
        <div className="w-20 h-20 shrink-0">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-3 flex flex-col justify-center min-w-0">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight mb-1">{event.title}</h4>
          <div className="text-xs text-brand-purple font-medium mb-0.5">{formatDate(event.startTime, 'MMM d • HH:mm')}</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{event.location}</div>
        </div>
      </div>
    );
  }


  return (
    <div
      onClick={onClick}
      className={`group flex flex-col w-full bg-white dark:bg-[#121212] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ${isDashboard
        ? 'hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)] hover:-translate-y-2'
        : 'shadow-none hover:shadow-xl'
        }`}
    >
      {/* Image Container */}
      <div className={`relative w-full overflow-hidden ${isDashboard ? 'h-52' : 'h-64'}`}>
        <img
          src={event.imageUrl || '../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png'}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.currentTarget;
            target.src = '../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png'
            target.className = 'w-full h-full object-cover transition-transform duration-700'
          }}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
            {event.category}
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {isDashboard && onToggleInterest && (
            <button
              onClick={onToggleInterest}
              className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${isLiked ? 'bg-red-500/90 border-red-500 text-white' : 'bg-black/30 border-white/10 text-white hover:bg-black/50'}`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {/* Price Badge Bottom Right */}
        {event.price && <div className="absolute bottom-4 right-4 z-10">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md border ${event.price === 0 ? 'bg-green-500/20 border-green-400/30 text-green-100' : 'bg-white/20 border-white/20 text-white'}`}>
            {event.price}
          </span>
        </div>}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1 relative">
        {/* Decorative Blur behind content in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-brand-purple uppercase tracking-wide bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-md">
            {format(event.startTime, 'yyyy/MM/d')}
          </span>
          <span className="text-xs font-medium text-gray-400">{format(event.startTime, 'HH:mm')}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-purple transition-colors">
          {event.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            {organizerAvatar && (
              <img
                src={organizerAvatar}
                alt={organizerName}
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {organizerName}
            </span>
          </div>

          {isDashboard && event.currentParticipants && (
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <Users size={12} />
              <span>{event.currentParticipants}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

