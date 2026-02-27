'use client';

import React from 'react';
import { Event } from '@/lib/types';
import { MapPin, Clock, Users, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEventListProps {
  events: Event[];
  onSelect: (e: Event) => void;
  onToggleInterest: (id: string) => void;
}

export default function TimelineEventList({ events, onSelect, onToggleInterest }: TimelineEventListProps) {
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(event.startTime, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <div className="pl-0 md:pl-4 space-y-8">
      {Object.entries(groupedEvents).map(([date, groupEvents]: [string, Event[]]) => {
        const [years, month, day] = format(date, 'yyyy-MMM-d').split('-');
        return (
          <div key={date} className="flex gap-4 md:gap-8 relative">

            {/* Left Column: Date (Sidebar) - Desktop Only */}
            <div className="flex-shrink-0 text-right pt-2 hidden md:block">
              <div className="sticky top-24 flex flex-col items-end">
                <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                  {day}
                </span>
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                  {month}
                </span>
              </div>
            </div>

            {/* Middle Column: Axis (Sidebar) - Desktop Only */}
            <div className="relative flex flex-col items-center flex-shrink-0 w-6 hidden md:flex">
              <div className="absolute top-3 bottom-0 w-[2px] bg-gray-100 dark:bg-white/5"></div>
              <div className="sticky top-24 w-4 h-4 rounded-full bg-brand-purple border-4 border-white dark:border-[#050505] bg-white shadow-sm z-10 mt-1.5"></div>
            </div>

            {/* Right Column: Events List */}
            <div className="flex-1 min-w-0 space-y-6 pt-6">
              {/* Mobile Date Header */}
              <div className="md:hidden flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-brand-purple"></div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{format(date, 'yyyy MMM d')}</span>
              </div>

              {groupEvents.map(event => {
                const organizerName = event.organizerName || '';
                const organizerAvatar = event.organizerAvatar || '';
                const isLiked = event.isLiked || event.isInterested || false;

                return (
                  <div
                    key={event.uuid}
                    onClick={() => onSelect(event)}
                    className="group relative flex flex-col md:flex-row h-auto w-full bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden hover:shadow-xl hover:border-gray-200 dark:hover:border-white/10 transition-all duration-300 cursor-pointer"
                  >
                    {/* Left: Image Section (Full Cover, approx 40%) */}
                    <div className="w-full md:w-[40%] relative overflow-hidden shrink-0">
                      <img
                        src={event.imageUrl || '../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png'}
                        onError={(e:React.SyntheticEvent<HTMLImageElement>) => {
                          const target = e.currentTarget;
                          target.src = '../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png'
                          target.className='w-full h-full object-cover transition-transform duration-700'
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 "
                        alt={event.title}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                      {/* Tag on picture (Top Left) */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-white/30 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    {/* Right: Content Section */}
                    <div className="flex-1 relative p-6 flex flex-col justify-center gap-1.5 overflow-hidden">
                      {/* Blur Background Effect */}
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-60 dark:opacity-40 blur-3xl scale-150 pointer-events-none saturate-150"
                        style={{ backgroundImage: `url(${event.imageUrl})` }}
                      ></div>

                      {/* Overlay to ensure text readability */}
                      <div className="absolute inset-0 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-[2px] pointer-events-none"></div>

                      {/* Content Container (z-10) */}
                      <div className="relative z-10 flex flex-col gap-2 pr-12">

                        {/* Line 1: Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
                          {event.title}
                        </h3>

                        {/* Line 2: Host */}
                        {organizerName && (
                          <div className="flex items-center gap-2">
                            {organizerAvatar && (
                              <img src={organizerAvatar} alt={organizerName} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
                              Hosted by <span className="text-gray-900 dark:text-white font-semibold">{organizerName}</span>
                            </span>
                          </div>
                        )}

                        {/* Line 3: Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Clock size={16} className="text-brand-purple shrink-0" />
                          <span className="font-medium truncate">{format(event.startTime, "HH:mm")} - {format(event.endTime, "HH:mm")}</span>
                        </div>

                        {/* Line 4: Location */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin size={16} className="text-brand-purple shrink-0" />
                          <span className="font-medium truncate">{event.location}</span>
                        </div>

                        {/* Line 5: Attendees */}
                        {event.currentParticipants && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#121212]" />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 pl-2">
                              +{event.currentParticipants} going
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Top Right: Interest Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleInterest(event.uuid); }}
                        className={`cursor-pointer absolute top-6 right-6 p-2 rounded-full transition-all z-20 ${isLiked ? 'bg-red-50 text-red-500 shadow-sm' : 'bg-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-red-500'}`}
                      >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      </button>

                      {/* Bottom Right: Price */}
                      {event.price && <div className="absolute bottom-6 right-6 z-20">
                        <span className={`text-sm font-normal px-4 py-2 rounded-md border ${event.price === 0 ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400' : 'bg-white border-gray-200 text-gray-900 dark:bg-white/5 dark:border-white/10 dark:text-white shadow-sm'}`}>
                          {event.price}
                        </span>
                      </div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

