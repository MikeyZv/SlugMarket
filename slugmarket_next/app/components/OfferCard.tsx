"use client"

import type { OfferDetails } from "@/lib/types"

type Props = {
    offer: OfferDetails
    isFromMe: boolean
    currentUserId: string
    onStatusChange: (offerId: string, status: "accepted" | "declined") => void
}

// Offers expire 48 hours after creation. This function calculates the expiry label and whether it's expired.
function getExpiryLabel(createdAt: string): { label: string; expired: boolean } {
    const expiresAt = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000)
    const msLeft = expiresAt.getTime() - Date.now()
    if (msLeft <= 0) return { label: "Expired", expired: true }
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60))
    if (hoursLeft < 1) return { label: "Expires in less than 1 hour", expired: false }
    if (hoursLeft < 24) return { label: `Expires in ${hoursLeft}h`, expired: false }
    return { label: `Expires in ${Math.floor(hoursLeft / 24)}d`, expired: false }
}

export default function OfferCard({ offer, isFromMe, currentUserId, onStatusChange }: Props) {
    const isSeller = currentUserId === offer.seller_id
    const isPending = offer.status === "pending"
    const { label: expiryLabel, expired } = getExpiryLabel(offer.created_at)
    const statusColor = offer.status === "accepted" ? "text-green-600" : "text-red-500"

    return (
        <div className={`w-64 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden ${isFromMe ? "self-end" : "self-start"}`}>
            {offer.listing && (
                <a href={`/products/${offer.listing.id}`} className="block">
                    <img src={offer.listing.image_urls[0]} alt={offer.listing.title} className="w-full h-32 object-cover" />
                </a>
            )}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-[#F5C518]/25 px-2.5 py-0.5 text-xs font-semibold text-[#0F2044] uppercase tracking-wide">
                        Offer
                    </span>
                    {offer.status !== "pending" && (
                        <span className={`text-xs font-semibold capitalize ${statusColor}`}>{offer.status}</span>
                    )}
                    {isPending && (
                        <span className={`text-xs font-medium ${expired ? "text-red-400" : "text-gray-400"}`}>{expiryLabel}</span>
                    )}
                </div>
                {offer.listing && (
                    <a href={`/products/${offer.listing.id}`} className="text-sm font-medium text-gray-700 hover:underline line-clamp-2 block mb-2">
                        {offer.listing.title}
                    </a>
                )}
                <p className="text-2xl font-bold text-[#0F2044]">${Number(offer.amount).toLocaleString()}</p>
                {isSeller && isPending && !expired && (
                    <div className="flex gap-2 mt-3">
                        <button onClick={() => onStatusChange(offer.id, "accepted")} className="flex-1 rounded-xl bg-[#0F2044] py-2 text-sm font-semibold text-white hover:bg-[#162d5a] transition cursor-pointer">Accept</button>
                        <button onClick={() => onStatusChange(offer.id, "declined")} className="flex-1 rounded-xl bg-gray-100 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition cursor-pointer">Decline</button>
                    </div>
                )}
            </div>
        </div>
    )
}
