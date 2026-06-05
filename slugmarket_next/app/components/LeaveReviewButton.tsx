"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import LeaveReviewModal from "./LeaveReviewModal";

type Props = {
    listingId: string;
    sellerId: string;
    sellerUsername: string;
    listingTitle: string;
    buyerId: string | null | undefined;
    sold: boolean;
}

export default function LeaveReviewButton(props: Props) {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const [alreadyReviewed, setAlreadyReviewed] = useState(false)
    const [open, setOpen] = useState(false)
    const [checked, setChecked] = useState(false) // check whether listing has been reviewed or not

    // boolean condition that user is the buyer of listing
    const isBuyer = !!user && user.id === props.buyerId && props.sold

    // checking if review exists
    useEffect(() => {
        // if user is not buyer don't load anything else
        if (!isBuyer || !user) return

        supabase
            .from("reviews")
            .select("review_id")
            .eq("listing_id", props.listingId)
            .eq("reviewer_id", user.id)
            .maybeSingle()
            .then(({ data }) => {
                setAlreadyReviewed(!!data)
                setChecked(true)
            })
    }, [isBuyer, user, props.listingId])

    // if review doesn't exist and user is elligble to review and user was sent to this listing page to review then set review modal open
    useEffect(() => {
        if (searchParams.get("review") === "true" && isBuyer && checked && !alreadyReviewed) {
            setOpen(true)
        }
    }, [searchParams, isBuyer, checked, alreadyReviewed])

    if (!isBuyer || !checked || alreadyReviewed) return null
    
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full rounded-xl border-2 border-yellow-400 bg-yellow-50 py-3 text-sm font-semibold text-gray-900 hover:bg-yellow-100"
            >
                Leave a Review for @{props.sellerUsername}
            </button>

            {open && (
                <LeaveReviewModal
                    {...props}
                    onClose={() => setOpen(false)}
                    onSubmitted={() => setAlreadyReviewed(true)}
                />
            )}
        </>
    )

}