'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, MapPin, Heart, Pencil, Trash2, Ticket, Download, Ban } from 'lucide-react';
import { Event, UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { eventApi } from '@/lib/api/event';
import { useEventStore } from '@/hooks/useEventStore';
import { useRouter, useSearchParams } from 'next/navigation';

interface EventDetailDialogProps {
    eventUuid: string | null;
    currentUser?: UserProfile | null;
    onToggleInterest: (id: string) => void;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
    onRegisterEvent?: (event: Event) => void;
    onUnregisterEvent?: (event: Event) => void;
    onLogin: () => void;
}

export default function EventDetailDialog({
    eventUuid,
    currentUser,
    onToggleInterest,
    onEdit,
    onDelete,
    onRegisterEvent,
    onUnregisterEvent,
    onLogin
}: EventDetailDialogProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { event, getEvent } = useEventStore();

    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                setIsScrolled(scrollRef.current.scrollTop > 200);
            }
        };
        const scrollContainer = scrollRef.current;
        if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
        return () => {
            if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
        };
    }, [event]);

    useEffect(() => {
        if (eventUuid) {
            getEvent(eventUuid);
        }
    }, [eventUuid])

    if (!event || !eventUuid) return null;

    const canEdit = event.isOwner;
    const canDelete = event.isOwner;
    const organizerName = event.organizerName || '';
    const organizerAvatar = event.organizerAvatar || '';
    const isLiked = event.isLiked || event.isInterested || false;

    const onClose = () => {
        const p = new URLSearchParams(params.toString());
        p.delete('e');
        router.push(`/app/discover`, {scroll:false})
        
    }

    // Generate QR Data if registered
    const qrData = currentUser ? `Event:${event.uuid};User:${currentUser.email};Ticket:${Math.random()}` : '';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#121212] w-full md:max-w-2xl h-full md:h-[90vh] md:rounded-xl shadow-2xl relative flex flex-col overflow-hidden">

                {/* Sticky Header */}
                <div
                    className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 transition-all duration-300 ${isScrolled
                        ? 'bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5 shadow-sm'
                        : 'bg-transparent'
                        }`}
                >
                    <div className={`flex-1 text-center transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate px-8">
                            {event.title}
                        </h3>
                    </div>

                    <button
                        onClick={onClose}
                        className={`cursor-pointer absolute right-4 p-2 rounded-full transition-colors ${isScrolled
                            ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200'
                            : 'bg-black/20 hover:bg-black/40 text-white backdrop-blur-md'
                            }`}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
                    {/* Image Header */}
                    <div className="relative h-72 md:h-80 w-full shrink-0">
                        {
                            // event.imageType === 'video' ? (
                            //     <video src={event.imageUrl} className="w-full h-full object-cover" autoPlay muted loop />
                            // ) : 
                            (
                                <img src={event.imageUrl || '../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png'} alt={event.title} className="w-full h-full object-cover"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        const target = e.currentTarget;
                                        target.src = '../9051cabf-bd78-4f29-acfa-b50f92dd82eb.png'
                                        target.className = 'opacity-50 object-center'
                                    }}
                                />
                            )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80"></div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent">
                            <span className="bg-brand-purple text-white text-xs font-bold px-2.5 py-1 rounded-md mb-3 inline-block shadow-sm">
                                {event.category}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight shadow-black drop-shadow-lg">
                                {event.title}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-200 text-sm font-medium">
                                <span className={event.isEnded ? "text-red-400" : (event.isSoldOut ? "text-orange-400" : "text-green-400")}>
                                    {event.isEnded ? 'Ended' : (event.isSoldOut ? 'Sold Out' : 'Available')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* INLINE TICKET SECTION (Visible only if Registered) */}
                    {event.isRegistered && (
                        <div className="mx-6 md:mx-8 -mt-6 relative z-20">
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col md:flex-row">
                                {/* Left Side: QR & ID */}
                                <div className="bg-gray-50 dark:bg-white/5 p-6 flex flex-col items-center justify-center border-r border-dashed border-gray-200 dark:border-white/10 relative">
                                    {/* Decorative semi-circles for ticket effect */}
                                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-white dark:bg-[#121212] dark:md:bg-[#121212] rounded-full z-10"></div>
                                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white dark:bg-[#121212] dark:md:bg-[#121212] rounded-full z-10"></div>

                                    <div className="bg-white p-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm mb-3">
                                        <img src={qrUrl} alt="Ticket QR" className="w-32 h-32 object-contain mix-blend-multiply dark:mix-blend-normal" />
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest text-center">
                                        ID: {event.uuid.substring(0, 4).toUpperCase()}-{(currentUser?.uuid || 'GUEST').substring(0, 4).toUpperCase()}
                                    </div>
                                </div>

                                {/* Right Side: Ticket Details */}
                                <div className="flex-1 p-6 flex flex-col justify-center bg-white dark:bg-[#1e1e1e]">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-200 dark:border-green-800">
                                                Confirmed
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">Ticket x1</span>
                                        </div>
                                        <button className="text-xs text-brand-purple hover:underline font-semibold flex items-center gap-1">
                                            <Download size={12} /> Save
                                        </button>
                                    </div>

                                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white leading-tight mb-4 line-clamp-2">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{format(event.startTime, 'yyyy/MM/d')}</div>
                                                <div className="text-xs text-gray-500">{format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
                                                {event.location}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-3 border-t border-dashed border-gray-100 dark:border-white/10 mt-1">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                                {currentUser?.avatarUrl ? (currentUser.avatarUrl.length > 2 ? currentUser.avatarUrl.substring(0, 2) : currentUser.avatarUrl) : 'GU'}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {currentUser?.name || 'Guest User'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 md:p-8 space-y-8">
                        {/* Meta Data Row */}
                        <div className="flex flex-col sm:flex-row gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/5">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-lg">{format(event.startTime, 'yyyy/MM/d')}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}</div>
                                    {/* <button className="text-xs text-brand-purple font-medium mt-1 hover:underline">Add to Calendar</button> */}
                                </div>
                            </div>
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/5">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-lg">{event.location}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{event.countryCode}</div>
                                    {/* <button className="text-xs text-brand-purple font-medium mt-1 hover:underline">View on Map</button> */}
                                </div>
                            </div>
                        </div>

                        {/* Host & Co-host Section */}
                        {organizerName && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Hosts</h3>
                                <div className="flex flex-wrap gap-4">
                                    {/* Organizer */}
                                    <div className="flex items-center gap-3 p-2 pr-4 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                        {organizerAvatar && (
                                            <img src={organizerAvatar} alt={organizerName} className="w-10 h-10 rounded-full object-cover" />
                                        )}
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">{organizerName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{event.organizerType === 'page' ? 'Page' : 'Organizer'}</div>
                                        </div>
                                    </div>

                                    {/* Co-Hosts */}
                                    {event.coHosts && event.coHosts.map(host => (
                                        <div key={host.username || host.uuid} className="flex items-center gap-3 p-2 pr-4 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                            <img src={host.avatarUrl} className="w-10 h-10 rounded-full bg-gray-300" />
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">{host.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Co-Host</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About Event</h3>
                            <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line">
                                {event.description}
                            </div>
                        </div>

                        {/* Attending People Section */}
                        {event.currentParticipants && (
                            <div className="border-t border-gray-100 dark:border-white/5 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attending</h3>
                                    {/* <span className="text-sm text-brand-purple font-semibold hover:underline cursor-pointer">View All</span> */}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#121212] bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                                            +{event.currentParticipants}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-bold text-gray-900 dark:text-white">{event.currentParticipants}</span> people going
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="h-4"></div>
                    </div>
                </div>

                {/* Sticky Footer Action Bar */}
                <div className="p-4 md:px-8 md:py-5 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] flex items-center justify-between z-40 shrink-0">

                    {/* Left side: Price or Edit buttons */}
                    {canEdit ? (
                        <div className="flex items-center gap-2">
                            {canDelete && (
                                <button
                                    onClick={() => onDelete && onDelete(event.uuid)}
                                    className="p-3 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                                    title="Delete Event"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button
                                onClick={() => onEdit && onEdit(event)}
                                className="bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                            >
                                <Pencil size={18} /> Edit Event
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Total Price</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{event.price ? event.price: "Free"}</span>
                        </div>
                    )}

                    {/* Right Side: Like & Register/Unregister */}
                    <div className="flex items-center gap-3 ml-auto">
                        <button
                            onClick={() => onToggleInterest(event.uuid)}
                            className={`cursor-pointer p-3 rounded-full border transition-colors ${isLiked
                                ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-500/30'
                                : 'border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        </button>

                        {currentUser ? (
                            canEdit ? null : (
                                event.isRegistered ? (
                                    <button
                                        onClick={() => onUnregisterEvent && onUnregisterEvent(event)}
                                        className="cursor-pointer bg-transparent border-2 border-red-500 text-red-500 px-6 md:px-8 py-3 rounded-full font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                    >
                                        <Ban size={18} /> Cancel Registration
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onRegisterEvent && onRegisterEvent(event)}
                                        disabled={event.isSoldOut || event.isEnded}
                                        className="cursor-pointer bg-black dark:bg-white text-white dark:text-black px-6 md:px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {event.isEnded ? 'Event Ended' : (event.isSoldOut ? 'Sold Out' : 'Register')}
                                        {!event.isEnded && !event.isSoldOut && <Ticket size={18} />}
                                    </button>
                                )
                            )
                        ) : (
                            <button
                                onClick={onLogin}
                                className="cursor-pointer bg-transparent border-2 border-black dark:border-white text-black dark:text-white px-6 py-3 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                Sign In to Register
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

