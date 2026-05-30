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
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-12 py-2"
                />
                {q.trim().length > 0 && (
                <button
                    type="submit"
                    aria-label="Submit search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    <ArrowRight />
                </button>
                )}
            </div>
        </form>
      );
}