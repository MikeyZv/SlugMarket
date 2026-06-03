"use client"

import type { OfferDetails } from "@/lib/types"

type Props = {
    offer: OfferDetails
    isFromMe: boolean
    currentUserId: string
    onStatusChange: (offerId: string, status: "accepted" | "declined") => void
}

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
    const statusColor =
        offer.status === "accepted" ? "text-green-600" :
        offer.status === "declined" ? "text-red-500" : "text-gray-400"

    return (
        <div className={`w-64 rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow-sm ${isFromMe ? "self-end" : "self-start"}`}>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Offer</p>
            {offer.listing && (
                <a href={`/products/${offer.listing.id}`} className="font-semibold text-gray-900 text-sm hover:underline line-clamp-2 block mb-2">
                    {offer.listing.title}
                    <img src={offer.listing.image_urls[0]} className="w-full h-32 object-cover rounded-lg mb-2" />
                </a>
            )}
            <p className="text-2xl font-bold text-gray-900">${Number(offer.amount).toLocaleString()}</p>
            <p className={`text-xs font-medium mt-0.5 capitalize ${statusColor}`}>{offer.status}</p>
            {isPending && (
                <p className={`text-xs mt-0.5 ${expired ? "text-red-400" : "text-gray-400"}`}>{expiryLabel}</p>
            )}
            {isSeller && isPending && !expired && (
                <div className="flex gap-2 mt-3">
                    <button onClick={() => onStatusChange(offer.id, "accepted")} className="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition">Accept</button>
                    <button onClick={() => onStatusChange(offer.id, "declined")} className="flex-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Decline</button>
                </div>
            )}
        </div>
    )
}
