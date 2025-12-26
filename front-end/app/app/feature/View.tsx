'use client'

import { ViewMode } from "@/lib/types"
import { Grid, List } from "lucide-react";

interface ViewToggleProps {
    setViewMode: (mode: ViewMode) => void;
    viewMode: ViewMode;
}
export default function ViewToggle({ setViewMode, viewMode }: ViewToggleProps) {
    return (
        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/5 ml-auto sm:ml-0 w-fit border border-gray-200 dark:border-white/10">
            <button
                onClick={() => setViewMode('list')}
                className={`cursor-pointer p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
                <List size={18} />
            </button>
            <button
                onClick={() => setViewMode('grid')}
                className={`cursor-pointer p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-black ' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
                <Grid size={18} />
            </button>
        </div>
    )
}