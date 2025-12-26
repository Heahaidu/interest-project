'use client'

import { CalendarIcon, Sparkles } from "lucide-react";
import { DateFilter } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";

interface DateControlsProps {
    dateFilter: DateFilter;
    setDateFilter: (filter: DateFilter) => void;
}

export default function DateControls({ dateFilter, setDateFilter }: DateControlsProps) {

    const [openFrom, setOpenFrom] = useState<boolean>(false);
    const [openTo, setOpenTo] = useState<boolean>(false);

    const toggleAuto = () => {
        setDateFilter({ ...dateFilter, isAuto: !dateFilter.isAuto });
    };

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        console.log(value);
        setDateFilter({ ...dateFilter, [field]: value, isAuto: false });
    };



    return (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 w-fit">
            <button
                onClick={toggleAuto}
                className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dateFilter.isAuto
                    ? 'bg-white text-black  shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-400'
                    }`}
            >
                <Sparkles size={14} />
                <span>Auto</span>
            </button>

            {!dateFilter.isAuto && (
                <div className="flex items-center pl-2 border-l border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="relative">
                        <input
                            type="date"
                            value={dateFilter.start}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            className="w-32 pl-2 pr-1 py-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <Popover open={openFrom} onOpenChange={setOpenFrom}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                >
                                    <CalendarIcon className="size-3.5" />
                                    <span className="sr-only">Select date</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="end"
                                alignOffset={-8}
                                sideOffset={10}
                            >
                                <Calendar
                                    mode="single"
                                    selected={dateFilter.start !== ''? new Date(dateFilter.start): undefined}
                                    captionLayout="dropdown"
                                    defaultMonth={dateFilter.start !== ''? new Date(dateFilter.start): undefined}
                                    onSelect={(date) => {
                                        date ? handleDateChange('start', format(date, 'yyyy-MM-dd')) : '';
                                        setOpenFrom(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <span className="dark:text-gray-300 text-gray-700">-</span>
                    <div className="relative">
                        <input
                            type="date"
                            value={dateFilter.end}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            className="w-32 pl-2 pr-1 py-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <Popover open={openTo} onOpenChange={setOpenTo}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                >
                                    <CalendarIcon className="size-3.5" />
                                    <span className="sr-only">Select date</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="end"
                                alignOffset={-8}
                                sideOffset={10}
                            >
                                <Calendar
                                    mode="single"
                                    selected={dateFilter.end !== ''? new Date(dateFilter.end): undefined}
                                    captionLayout="dropdown"
                                    defaultMonth={dateFilter.end !== ''? new Date(dateFilter.end): undefined}
                                    onSelect={(date) => {
                                        date ? handleDateChange('end', format(date, 'yyyy-MM-dd')) : '';
                                        setOpenTo(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            )}
            {dateFilter.isAuto && (
                <div className="hidden sm:block text-xs text-gray-400 px-3">
                    Smart date matching
                </div>
            )}
        </div>
    )
}