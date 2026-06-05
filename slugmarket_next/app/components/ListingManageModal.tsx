"use client";
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Listing } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import DeleteButton from "./DeleteButton"
import { useAuth } from "./AuthProvider"
import { X, ExternalLink, Pencil, Bookmark } from "lucide-react"

type Profile = { id: string; username: string }

export default function ListingManageModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
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
    const [bookmarkCount, setBookmarkCount] = useState<number | null>(null)
    const myUsername = user?.user_metadata?.username

    useEffect(() => {
        if (!confirmingSold || buyerQuery.trim().length < 1) {
            setBuyerSuggestions([]); setShowSuggestions(false); return
        }
        const timer = setTimeout(async () => {
            const { data } = await supabase.from("profiles").select("id, username").ilike("username", `%${buyerQuery.trim()}%`).limit(5)
            setBuyerSuggestions((data ?? []).filter((p) => p.username !== myUsername))
            setShowSuggestions(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [buyerQuery, confirmingSold, myUsername])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) setShowSuggestions(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    useEffect(() => {
        supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("product_id", listing.id).then(({ count }) => setBookmarkCount(count))
    }, [listing.id])

    async function handleConfirmSale() {
        if (!selectedBuyer?.id) { setError("Please select a buyer from the list."); return }
        setSaving(true); setError(null)
        const { error: err } = await supabase.from("product_listings").update({ sold: true, buyer_id: selectedBuyer.id }).eq("id", listing.id)
        setSaving(false)
        if (err) { setError(err.message); return }
        await supabase.from("notifications").insert({ user_id: selectedBuyer.id, message: `Your purchase of "${listing.title} was confirmed! Give @${myUsername} a review.`, image_url: listing.image_urls[0] })
        onClose(); router.refresh()
    }

    function cancelConfirm() {
        setConfirmingSold(false)
        setBuyerQuery("")
        setSelectedBuyer(null)
        setBuyerSuggestions([])
        setShowSuggestions(false)
    }

    const section = "px-6 pb-6 flex flex-col gap-3 border-t border-gray-100 pt-5"
    const btn = "w-full rounded-xl py-3 text-sm font-semibold transition cursor-pointer"

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-[#0F2044]">{confirmingSold ? "Confirm Sale" : "Manage Listing"}</h2>
                    <button type="button" aria-label="Close" onClick={onClose} className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                {/* Listing preview */}
                <div className="px-6 py-5 grid grid-cols-[80px_1fr] gap-x-4">
                    <Image src={listing.image_urls[0]} alt={listing.title} width={80} height={80} className="rounded-xl object-cover w-20 h-20 row-span-3 self-center" />
                    <p className="font-semibold text-gray-900 truncate self-end">{listing.title}</p>
                    <p className="text-xl font-bold text-[#0F2044]">${Number(listing.price).toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{listing.condition}</span>
                        {listing.sold && <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Sold</span>}
                        {bookmarkCount !== null && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Bookmark size={11} className="fill-gray-400 text-gray-400" />
                                {bookmarkCount}
                            </span>
                        )}
                    </div>
                </div>

                {confirmingSold ? (
                    <div ref={suggestionRef} className={section}>
                        <p className="text-sm text-gray-600">Who did you sell this to?</p>
                        <input type="text" autoFocus placeholder="Search by username…"
                            value={selectedBuyer ? `@${selectedBuyer.username}` : buyerQuery}
                            onChange={(e) => { setBuyerQuery(e.target.value); setSelectedBuyer(null) }}
                            onFocus={() => buyerSuggestions.length > 0 && setShowSuggestions(true)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2044]/30 focus:border-[#0F2044]"
                        />
                        {showSuggestions && buyerSuggestions.length > 0 && (
                            <div className="mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {buyerSuggestions.map((p) => (
                                    <button key={p.id} type="button" className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#0F2044]/5 transition cursor-pointer"
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            setSelectedBuyer(p)
                                            setBuyerQuery("")
                                            setShowSuggestions(false)
                                        }}>
                                        @{p.username}
                                    </button>
                                ))}
                            </div>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="button" onClick={handleConfirmSale} disabled={saving || !selectedBuyer} className={`${btn} bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed`}>
                            {saving ? "Saving..." : selectedBuyer ? `Confirm sale to @${selectedBuyer.username}` : "Confirm sale"}
                        </button>
                        <button type="button" onClick={cancelConfirm} className={`${btn} border-2 border-gray-200 bg-white text-gray-500 hover:bg-gray-50`}>Cancel</button>
                    </div>
                ) : (
                    <div className={section}>
                        <Link href={`/products/${listing.id}`} className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-[#0F2044]/20 bg-white py-3 text-sm font-semibold text-[#0F2044] hover:bg-[#0F2044]/5 transition">
                            View listing <ExternalLink size={14} />
                        </Link>
                        <button type="button" disabled={listing.sold} onClick={() => !listing.sold && setConfirmingSold(true)} className={`${btn} border-2 border-green-500 bg-white text-green-600 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed`}>
                            {listing.sold ? "Already sold" : "Mark as sold"}
                        </button>
                        <Link href={`/products/edit/${listing.id}`} className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-[#0F2044] bg-white py-3 text-sm font-semibold text-[#0F2044] hover:bg-[#0F2044]/5 transition">
                            <Pencil size={14} />
                            Edit listing
                        </Link>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <DeleteButton productId={listing.id} sellerId={listing.seller_id} imageUrls={listing.image_urls}
                            className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-semibold text-gray-500 transition hover:border-red-300 hover:text-red-500 cursor-pointer" />
                    </div>
                )}
            </div>
        </div>
    )
}
