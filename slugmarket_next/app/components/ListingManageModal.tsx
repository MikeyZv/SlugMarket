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
    onClose: () => void; // function to close out of modal after leaving profile page
}

// This component is a modal that allows users to manage their product listings. It provides options to preview the listing, mark it as sold, edit the listing, or delete it. The modal also handles the necessary API calls to update the listing's status in the database and refreshes the page to reflect changes.
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Exit modal button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-2xl leading-none text-gray-400 hover:text-gray-600"
                >
                    x
                </button>

                <h2 id="manage-listing-title" className="text-xl font-bold text-gray-900 pr-8">
                    Manage Listing
                </h2>

                {/* Preview of listing (not clickable) */}
                <div className="rounded-xl border p-4 shadow-sm">
                    <div className="flex gap-4 items-start">
                        <div className="relative h-28 w-36 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                            <Image
                                src={listing.image_urls[0]}
                                alt={listing.title}
                                fill
                                sizes="160px"
                                className="object-cover"
                            />
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                            <p className="mt-2 font-bold text-gray-900">${listing.price}</p>
                        </div>
                    </div>
                </div>

                {/* Link to product listing */}
                <Link
                    href={`/products/${listing.id}`}
                    className="text-center text-[#3567F1] font-medium hover:underline"
                >
                    Preview Listing →
                </Link>

                {/* Button to mark as sold */}
                <button
                    type="button"
                    onClick={handleMarkAsSold}
                    disabled={saving || listing.sold}
                    className="w-full rounded--xl bg-gray-900 py-3 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {listing.sold ? "Already Sold" : saving ? "Saving..." : "Mark as sold"}
                </button>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                {/* Link to edit listing */}
                <Link
                    href={`/products/edit/${listing.id}`}
                    className="block w-full rounded-xl border-2 border-black bg-white py-3 text-center text-lg font-semibold text-black transition hover:bg-gray-50"
                >
                    Edit Listing
                </Link>

                {/* Delete Listing Button */}
                <DeleteButton productId={listing.id} sellerId={listing.seller_id} imageUrls={listing.image_urls} />
            </div>
        </div>
    )
}