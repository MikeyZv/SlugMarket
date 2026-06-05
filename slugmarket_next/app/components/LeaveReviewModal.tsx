"use client";

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"

type Props = {
    listingId: string;
    sellerId: string;
    sellerUsername: string;
    listingTitle: string;
    onClose: () => void;
    onSubmitted?: () => void;
}

export default function LeaveReviewModal({ listingId, sellerId, sellerUsername, listingTitle, onClose, onSubmitted }: Props) {
    const { user } = useAuth()
    const [rating, setRating] = useState(0)
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user || rating < 1) return

        setLoading(true)
        setError(null)

        // insert review
        const { error: insertError } = await supabase
            .from("reviews")
            .insert({
                reviewer_id: user.id,
                reviewed_user_id: sellerId,
                listing_id: listingId,
                rating,
                review_text: text.trim() || null,
            })

        setLoading(false)
        if (insertError) {
            setError(insertError.message)
            return
        }

        onSubmitted?.()
        window.dispatchEvent(
            new CustomEvent("review-submitted", { detail: { profileId: sellerId } })
        )
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <form
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                {/* Review Modal heading */}
                <h2 className="text-xl font-bold text-gray-900">Review @{sellerUsername}</h2>
                <p className="text-sm text-gray-500">For: {listingTitle}</p>

                {/* star selector */}
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                {/* optional text to add */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Optional review..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />

                {error && <p className={"text-sm text-red-500"}>{error}</p>}

                {/* submit button */}
                <button
                    type="submit"
                    disabled={loading || rating < 1}
                    className="w-full rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-gray-900 disabled:opacity-40"
                >
                    {loading ? "Submitting..." : "Submit Review"}
                </button>

            </form>
        </div>
    )
}