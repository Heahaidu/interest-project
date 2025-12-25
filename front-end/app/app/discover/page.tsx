'use client';

import { useEffect, useRef, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
import { DateFilter, Event, ViewMode } from '@/lib/types';
import { Check, ChevronDown, Globe, Menu, Search } from 'lucide-react';
import AutoBanner from '@/components/common/AutoBanner';
import SearchTool from '../feature/SearchTool';
import DateControls from '../feature/DateControls';
import ViewToggle from '../feature/View';
import TimelineEventList from '@/components/shared/TimelineEventList';
import GridEventList from '@/components/shared/GridEventList';
import { eventApi } from '@/lib/api/event';
import { ALL_CATEGORIES, AVAILABLE_COUNTRIES } from '@/lib/services/mockData';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEventStore } from '@/hooks/useEventStore';

export default function Discover() {

    // -- Filters State --

    const [visibleCategories, setVisibleCategories] = useState(ALL_CATEGORIES.slice(0, 6));
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isMoreCatOpen, setIsMoreCatOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('Vietnam');
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>();
    const [dateFilter, setDateFilter] = useState<DateFilter>({ start: '', end: '', isAuto: true });
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const [events, setEvents] = useState<Event[]>([]);

    // Refs for clicking outside dropdowns
    const moreCatRef = useRef<HTMLDivElement>(null);
    const countryRef = useRef<HTMLDivElement>(null);
    // const searchParams = useSearchParams();

    const hiddenCategories = ALL_CATEGORIES.filter(c => !visibleCategories.includes(c));

    const router = useRouter();
    const params = useSearchParams();
    const setSelectedEvent = useEventStore(e => e.setSelectedEvent);

    // Handler

    const handleCategorySelect = (cat: string) => {
        setSelectedCategory(cat);

        if (!visibleCategories.includes(cat)) {
            const newVisible = [...visibleCategories];
            newVisible[newVisible.length - 1] = cat;
            setVisibleCategories(newVisible);
        }
        setIsMoreCatOpen(false);
    };


    const onSelectedEvent = (e: Event) => {
        const p = new URLSearchParams(params.toString());
        p.set(`e`, e.uuid);
        setSelectedEvent(e);
        router.push(`/app/discover?${p.toString()}`, {scroll: false});
    }



    useEffect(() => {
        load()

        const handleClickOutside = (event: MouseEvent) => {

            if (moreCatRef.current && !moreCatRef.current.contains(event.target as Node)) {
                setIsMoreCatOpen(false);
            }
            if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
                setIsCountryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    // API
    async function load() {
        const { items, nextCursor, hasNext } = await eventApi.list();
        setEvents(items)
    }

    const filteredEvents = events;

    return (
        <main className="flex-1 animate-in fade-in duration-300 slide-in-from-bottom-2" >

            <div className="p-6 md:p-10 max-w-7xl mx-auto">
                {/* Top Filters */}
                <div className="flex flex-col xl:flex-row gap-6 mb-8 items-start xl:items-center justify-between">
                    {/* Categories */}
                    <div className="flex flex-wrap items-center gap-3">
                        {visibleCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`cursor-pointer px-3 py-1 rounded-sm text-sm font-normal transition-all ${selectedCategory === cat
                                    ? 'bg-black text-white dark:bg-white dark:text-black border border-gray-200'
                                    : 'bg-white border border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 '
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}

                        {/* More Button */}
                        <div className="relative" ref={moreCatRef}>
                            <button
                                onClick={() => setIsMoreCatOpen(!isMoreCatOpen)}
                                className={`cursor-pointer flex items-center gap-1 px-3 py-1 rounded-sm text-sm font-normal transition-all ${isMoreCatOpen || hiddenCategories.includes(selectedCategory)
                                    ? 'bg-black text-white dark:bg-white dark:text-black border border-gray-200'
                                    : 'bg-white border border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 '
                                    }`}
                            >
                                More <ChevronDown size={14} />
                            </button>

                            {isMoreCatOpen && (
                                <div className="absolute top-full mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-sm shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    {hiddenCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategorySelect(cat)}
                                            className="cursor-pointer w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-200 flex justify-between items-center"
                                        >
                                            {cat}
                                            {selectedCategory === cat && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Country Selector */}
                    <div className="flex items-center gap-3 w-full xl:w-auto relative" ref={countryRef}>
                        <button
                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                            className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                        >
                            <Globe size={16} />
                            <span>{selectedCountry}</span>
                            <ChevronDown size={14} className="ml-1 text-gray-400" />
                        </button>

                        {isCountryOpen && (
                            <div className="absolute top-full mt-2 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-sm shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                {AVAILABLE_COUNTRIES.map(country => (
                                    <button
                                        key={country}
                                        onClick={() => { setSelectedCountry(country); setIsCountryOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-200 flex justify-between items-center"
                                    >
                                        {country}
                                        {selectedCountry === country && <Check size={14} className="text-brand-purple" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Featured Banner (only on Discover page and All category) */}
                <AutoBanner events={events} />

                {/* Filter (Search, Date, View) */}
                <div className='flex flex-col justify-between gap-4 xl:flex-row mb-8'>
                    <SearchTool onSearch={setSearchTerm} />
                    <div className='flex flex-col gap-3 md:flex-row w-full xl:w-auto justify-between'>
                        <DateControls dateFilter={dateFilter} setDateFilter={setDateFilter} />
                        <ViewToggle setViewMode={setViewMode} viewMode={viewMode} />
                    </div>
                </div>

                {/* Events List */}
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No events found</h3>
                        <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'list'
                            ? <TimelineEventList events={filteredEvents} onSelect={onSelectedEvent} onToggleInterest={() => { }} />
                            : <GridEventList events={filteredEvents} onSelect={onSelectedEvent} onToggleInterest={() => { }} />
                        }
                    </>
                )}
            </div>


        </main >


    );
}
