"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

// This component renders a search bar in the navigation that allows users to search for listings. 
// It manages the search query state, handles form submission to navigate to the search results page, and clears the search input when navigating to a different page.
export default function NavSearchBar() {
    const router = useRouter()
    const pathname = usePathname()
    const [q, setQ] = useState("")

    // clear searchbar when going to different page
    useEffect(() => {
        setQ("")
    }, [pathname])

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        const query = q.trim()
        if (!query) {
            setQ("")
            return
        }

        router.push(`/search?q=${encodeURIComponent(query)}`)
        setQ("") // clear searchbar after submitting    
    }

    return (
        <form onSubmit={onSubmit} className="flex items-center w-full">
            <div className="relative w-full">
                <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search listings…"
                    className="w-full rounded-full bg-gray-100 pl-4 pr-10 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#0F2044]/20 transition"
                />
                {q.trim().length > 0 && (
                    <button
                        type="submit"
                        aria-label="Submit search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-[#0F2044] text-white transition hover:bg-[#162d5a] cursor-pointer"
                    >
                        <ArrowRight size={13} />
                    </button>
                )}
            </div>
        </form>
      );
}