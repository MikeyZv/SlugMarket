"use client";

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Listing } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import DeleteButton from "./DeleteButton"
import { useAuth } from "./AuthProvider"

type Profile = { id: string; username: string }

type ListingManageModalProps = {
    listing: Listing;
    onClose: () => void;
}

export default function ListingManageModal({ listing, onClose }: ListingManageModalProps) {
    const router = useRouter()
    const { user } = useAuth()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmingSold, setConfirmingSold] = useState(false)
    const [buyerQuery, setBuyerQuery] = useState("")
    const [buyerSuggestions, setBuyerSuggestions] = useState<Profile[]>([])
    const [selectedBuyer, setSelectedBuyer] = useState<Profile | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestionRef = useRef<HTMLDivElement>(null)

    const myUsername = user?.user_metadata?.username

    // Fetch buyer suggestions when the buyer query changes and the user is confirming the sale. 
    // It uses a debounced effect to avoid making too many requests while the user is typing, and 
    // it updates the list of suggestions based on the query.
    useEffect(() => {
        if (!confirmingSold) return

        if (buyerQuery.trim().length < 1) {
            setBuyerSuggestions([])
            setShowSuggestions(false)
            return
        }

        const timer = setTimeout(async () => {
            const { data } = await supabase
                .from("profiles")
                .select("id, username")
                .ilike("username", `%${buyerQuery.trim()}%`)
                .limit(5)
            setBuyerSuggestions((data ?? []).filter((p) => p.username !== myUsername))
            setShowSuggestions(true)
        }, 200)

        return () => clearTimeout(timer)
    }, [buyerQuery, confirmingSold, myUsername])

    // Effect to handle clicks outside the buyer suggestions dropdown, which 
    // will close the suggestions when the user clicks elsewhere on the page.
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    async function handleConfirmSale() {
        if (!selectedBuyer?.id) {
            setError("Please select a buyer from the list.")
            return
        }

        setSaving(true)
        setError(null)

        const { error: updateError } = await supabase
            .from("product_listings")
            .update({ sold: true, buyer_id: selectedBuyer.id })
            .eq("id", listing.id)

        setSaving(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        onClose()
        router.refresh()
    }

    function handleCancelConfirm() {
        setConfirmingSold(false)
        setBuyerQuery("")
        setSelectedBuyer(null)
        setBuyerSuggestions([])
        setShowSuggestions(false)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {confirmingSold ? "Confirm Sale" : "Manage Listing"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Listing preview */}
                <div className="px-6 py-5">
                    <div className="flex gap-4 items-center">
                        <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                            <Image
                                src={listing.image_urls[0]}
                                alt={listing.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">
                                ${Number(listing.price).toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                    {listing.condition}
                                </span>
                                {listing.sold && (
                                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                        Sold
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {confirmingSold ? (
                    <div className="px-6 pb-6 flex flex-col gap-3 border-t border-gray-100 pt-5">
                        <p className="text-sm text-gray-600">Who did you sell this to?</p>

                        <div ref={suggestionRef}>
                            <input
                                type="text"
                                value={selectedBuyer ? `@${selectedBuyer.username}` : buyerQuery}
                                onChange={(e) => {
                                    setBuyerQuery(e.target.value)
                                    setSelectedBuyer(null)
                                }}
                                onFocus={() => buyerSuggestions.length > 0 && setShowSuggestions(true)}
                                placeholder="Search by username…"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                autoFocus
                            />
                            {showSuggestions && buyerSuggestions.length > 0 && (
                                <ul className="mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    {buyerSuggestions.map((profile) => (
                                        <li key={profile.id}>
                                            <button
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    setSelectedBuyer(profile)
                                                    setBuyerQuery("")
                                                    setShowSuggestions(false)
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                                            >
                                                @{profile.username}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <button
                            type="button"
                            onClick={handleConfirmSale}
                            disabled={saving || !selectedBuyer}
                            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {saving ? "Saving..." : selectedBuyer ? `Confirm sale to @${selectedBuyer.username}` : "Confirm sale"}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancelConfirm}
                            className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="px-6 pb-6 flex flex-col gap-3 border-t border-gray-100 pt-5">
                        <Link
                            href={`/products/${listing.id}`}
                            className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                        >
                            View listing <span className="text-gray-400">↗</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => !listing.sold && setConfirmingSold(true)}
                            disabled={listing.sold}
                            className="w-full rounded-xl border-2 border-emerald-500 bg-white py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {listing.sold ? "Already sold" : "Mark as sold"}
                        </button>

                        <Link
                            href={`/products/edit/${listing.id}`}
                            className="flex items-center justify-center w-full rounded-xl border-2 border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Edit listing
                        </Link>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <DeleteButton
                            productId={listing.id}
                            sellerId={listing.seller_id}
                            imageUrls={listing.image_urls}
                            className="w-full rounded-xl border-2 border-red-400 bg-white py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
