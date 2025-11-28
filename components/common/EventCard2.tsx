import React from 'react';
import { Event, ViewMode } from '@/lib/types';

interface EventCardProps {
  event: Event;
  viewMode?: ViewMode;
  onInterestToggle?: (id: string) => void;
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, viewMode = 'grid', onInterestToggle, onClick }) => {
  const isEnded = event.status === 'ended';
  const isFull = event.status === 'full';

  // Common Heart Button
  const HeartButton = () => (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onInterestToggle?.(event.id);
      }}
      className={` cursor-pointer
        p-2 rounded-full backdrop-blur-md transition-all duration-200
        ${event.isInterested 
          ? 'bg-red-500 text-white' 
          : 'bg-black/20 text-white hover:bg-black/40 border border-white/20'}
      `}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={event.isInterested ? "currentColor" : "none"} 
        stroke="currentColor" 
        className="w-5 h-5"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  );

  // Status Badge
  const StatusBadge = () => {
    if (isEnded) return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-[2px]">
            <span className="px-4 py-2 rounded-full bg-zinc-800/90 text-zinc-300 font-bold tracking-widest border border-white/10 uppercase text-sm">Event Ended</span>
        </div>
    );
    if (isFull) return (
      <div className="absolute top-3 left-3 px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-md uppercase tracking-wider backdrop-blur-md shadow-lg">
        Sold Out
      </div>
    );
    return null;
  };

  const DateDisplay = () => {
     const dateObj = new Date(event.date);
     const day = dateObj.getDate();
     const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
     
     return (
         <div className="flex flex-col items-center justify-center min-w-[3rem] text-zinc-500 dark:text-zinc-400">
             <span className="text-xs font-bold tracking-wider">{month}</span>
             <span className="text-2xl font-bold text-black dark:text-white">{day}</span>
         </div>
     );
  };

  if (viewMode === 'list') {
    return (
      <div onClick={onClick} className={`group relative flex gap-6 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 ${isEnded ? 'opacity-75' : ''}`}>
        {/* Date Column */}
        <div className="hidden sm:flex flex-col items-center pt-2 gap-4 border-r border-zinc-200 dark:border-zinc-800 pr-6">
           <DateDisplay />
           <div className="flex-1 w-px bg-zinc-200 dark:bg-zinc-800"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex gap-4 md:gap-6">
            <div className="relative h-24 w-24 md:h-32 md:w-48 shrink-0 overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                <img 
                src={event.imageUrl} 
                alt={event.title} 
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isEnded ? 'grayscale' : ''}`}
                />
                <StatusBadge />
            </div>

            <div className="flex flex-col flex-1 py-1">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mb-2 uppercase tracking-wide">
                            {event.category}
                        </span>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {event.title}
                        </h3>
                    </div>
                    <div className="sm:hidden pl-2">
                        <DateDisplay />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {event.time}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.location}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <img src={event.organizer.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                         <span className="text-xs text-zinc-500 dark:text-zinc-400">by {event.organizer.name}</span>
                         {event.attendeesCount > 0 && (
                            <>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{event.attendeesCount} going</span>
                            </>
                         )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{event.price}</span>
                        <div className="scale-75 origin-right">
                           <HeartButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div onClick={onClick} className={`group relative flex flex-col gap-3 cursor-pointer ${isEnded ? 'opacity-70' : ''}`}>
      <div className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 ">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${isEnded ? 'grayscale' : ''}`}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 dark:opacity-80 transition-opacity duration-300" />
        
        <StatusBadge />
        
        <div className="absolute top-3 right-3 flex gap-2">
            <div className="rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-black dark:text-white border border-transparent dark:border-white/10">
            {event.category}
            </div>
        </div>

        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <HeartButton />
        </div>
      </div>

      <div className="flex flex-col gap-1 p-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          <span className="text-red-500">{new Date(event.date).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</span>
          <span>•</span>
          <span>{event.time}</span>
        </div>
        
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-zinc-200 transition-colors">
          {event.title}
        </h3>
        
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
          {event.location}
        </p>

        <div className="mt-2 flex items-center gap-2">
            <img src={event.organizer.avatarUrl} alt={event.organizer.name} className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">by <span className="text-zinc-900 dark:text-zinc-200 font-medium">{event.organizer.name}</span></span>
            <div className="flex-grow"></div>
            <span className="text-sm text-zinc-900 dark:text-white font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{event.price}</span>
        </div>
      </div>
    </div>
  );
};
