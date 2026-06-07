"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type OfferState = "checking" | "available" | "alreadyOffered" | "accepted";

type Props = {
    listingPrice: number;
    listingId: string;
    listingTitle: string;
    listingImageUrl: string;
    sellerId: string;
    sold?: boolean;
};

// Disabled-button variants keyed by the situation that locks the offer button.
const LOCKED: Record<string, { label: string; cls: string }> = {
    sold: { label: "SOLD", cls: "bg-gray-200 text-gray-500" },
    accepted: { label: "Offer Accepted", cls: "bg-green-100 text-green-700" },
    alreadyOffered: { label: "Offer Sent", cls: "bg-gray-200 text-gray-500" },
};

// "Make Offer" button + modal. Locks the button when the item is sold or the
// user already has an active offer (declined and expired offers don't count).
// Submitting creates the offer, a conversation if needed, a chat message, and a
// seller notification.
export default function MakeOfferButton({ listingPrice, listingId, listingTitle, listingImageUrl, sellerId, sold }: Props) {
    const { user } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offerState, setOfferState] = useState<OfferState>("checking");

    useEffect(() => {
        if (!user) { setOfferState("available"); return; }
        let active = true;
        (async () => {
            // Ignore offers older than 48h (expired) and declined offers.
            const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
            const { data } = await supabase.from("offers").select("status")
                .eq("listing_id", listingId).eq("buyer_id", user.id)
                .neq("status", "declined").gt("created_at", cutoff).limit(1).maybeSingle();
            if (active) setOfferState(!data ? "available" : data.status === "accepted" ? "accepted" : "alreadyOffered");
        })();
        return () => { active = false; };
    }, [user, listingId]);

    if (user?.id === sellerId) return null;

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault();
        if (!user) { router.push("/signin"); return; }
        setLoading(true);
        setError(null);
        try {
            // Conversation IDs are stored with the lower user id first.
            const [user1_id, user2_id] = [user.id, sellerId].sort();
            const { data: existing } = await supabase.from("conversations").select("id")
                .eq("user1_id", user1_id).eq("user2_id", user2_id).maybeSingle();
            let conversationId = existing?.id;
            if (!conversationId) {
                const { data: created, error: convoError } = await supabase.from("conversations")
                    .insert({ user1_id, user2_id }).select("id").single();
                if (convoError) throw convoError;
                conversationId = created.id;
            }
            const { data: offer, error: offerError } = await supabase.from("offers")
                .insert({ listing_id: listingId, buyer_id: user.id, seller_id: sellerId, amount: Number(offerAmount), status: "pending" })
                .select("id").single();
            if (offerError) throw offerError;
            const { error: msgError } = await supabase.from("messages")
                .insert({ conversation_id: conversationId, sender_id: user.id, body: `Offer: $${Number(offerAmount).toLocaleString()}`, offer_id: offer.id });
            if (msgError) throw msgError;
            await supabase.from("notifications")
                .insert({ user_id: sellerId, message: `New offer of $${Number(offerAmount)}`, link: `/messages?c=${conversationId}`, image_url: listingImageUrl });
            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        // Lock the button only once the user dismisses the success screen.
        if (submitted) setOfferState("alreadyOffered");
        setOpen(false); setSubmitted(false); setOfferAmount(""); setError(null);
    }

    const locked = LOCKED[sold ? "sold" : offerState];
    if (locked)
        return <button disabled className={`w-full rounded-xl py-3 md:py-4 text-lg md:text-2xl font-semibold cursor-not-allowed ${locked.cls}`}>{locked.label}</button>;

    return (
        <>
            <button
                onClick={() => { if (!user) { router.push("/signin"); return; } setOpen(true); }}
                disabled={offerState === "checking"}
                className="w-full rounded-xl bg-[#F5C518] py-3 md:py-4 text-lg md:text-2xl font-semibold text-[#0F2044] shadow-sm transition hover:bg-[#fde047] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Make Offer
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                        {submitted ? (
                            <div className="flex flex-col items-center gap-4 py-4">
                                <div className="text-4xl">✓</div>
                                <p className="text-xl font-semibold text-gray-900">Offer sent!</p>
                                <p className="text-gray-500 text-center">
                                    Your offer of <span className="font-semibold">${Number(offerAmount).toLocaleString()}</span> for <span className="font-semibold">{listingTitle}</span> has been sent to the seller.
                                </p>
                                <button onClick={handleClose} className="mt-2 w-full rounded-xl bg-[#0F2044] py-3 text-lg font-semibold text-white hover:bg-[#162d5a] transition cursor-pointer">Done</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
                                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer">&times;</button>
                                </div>
                                <p className="text-gray-500 text-sm">Listed price: <span className="font-semibold text-gray-800">${Number(listingPrice).toLocaleString()}</span></p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                                    <input type="number" min="1" step="0.01" required value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder="Enter your offer" className="w-full rounded-xl border-2 border-gray-200 py-3 pl-8 pr-4 text-lg focus:border-[#0F2044] focus:outline-none" />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#F5C518] py-3 text-lg font-semibold text-[#0F2044] hover:bg-[#fde047] transition disabled:opacity-50 cursor-pointer">{loading ? "Sending…" : "Send Offer"}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
