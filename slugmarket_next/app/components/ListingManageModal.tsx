"use client";

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Listing } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import DeleteButton from "./DeleteButton"

type ListingManageModalProps = {
    listing: Listing;
    onClose: () => void;
}

// This component renders a modal for managing a product listing. 
// It allows the seller to view the listing details, navigate to the listing page, mark it as sold, edit it, or delete it.
export default function ListingManageModal({ listing, onClose }: ListingManageModalProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleMarkAsSold() {
        if (listing.sold) return

        setSaving(true)
        setError(null)

        const { error: updateError } = await supabase.from("product_listings")
                                                     .update({ sold: true })
                                                     .eq("id", listing.id)
        setSaving(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        onClose()
        router.refresh()
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
                    <h2 className="text-lg font-semibold text-gray-900">Manage Listing</h2>
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

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-col gap-3 border-t border-gray-100 pt-5">
                    <Link
                        href={`/products/${listing.id}`}
                        className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                    >
                        View listing <span className="text-gray-400">↗</span>
                    </Link>

                    <button
                        type="button"
                        onClick={handleMarkAsSold}
                        disabled={saving || listing.sold}
                        className="w-full rounded-xl border-2 border-emerald-500 bg-white py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {listing.sold ? "Already sold" : saving ? "Saving..." : "Mark as sold"}
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
            </div>
        </div>
    )
}
