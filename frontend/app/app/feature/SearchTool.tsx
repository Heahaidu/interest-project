'use client'

import { Search } from "lucide-react";

interface SearchToolProps {
    onSearch: (search: string) => void;
}

export default function SearchTool({onSearch}: SearchToolProps) {
    return (
        <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
                type="text"
                placeholder="Search events..."
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-purple outline-none transition-all"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    )
}