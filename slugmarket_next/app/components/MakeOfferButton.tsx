"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type Props = {
    listingPrice: number;
    listingId: string;
    listingTitle: string;
    sellerId: string;
};

export default function MakeOfferButton({ listingPrice, listingId, listingTitle, sellerId }: Props) {
    const { user } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [offerAmount, setOfferAmount] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Don't show to the seller of this listing
    if (user?.id === sellerId) return null;

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault();
        if (!user) {
            router.push("/signin");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Find or create a conversation between buyer and seller
            const user1_id = user.id < sellerId ? user.id : sellerId;
            const user2_id = user.id < sellerId ? sellerId : user.id;

            let conversationId: string;

            const { data: existing } = await supabase
                .from("conversations")
                .select("id")
                .eq("user1_id", user1_id)
                .eq("user2_id", user2_id)
                .maybeSingle();

            if (existing) {
                conversationId = existing.id;
            } else {
                const { data: created, error: convoError } = await supabase
                    .from("conversations")
                    .insert({ user1_id, user2_id })
                    .select("id")
                    .single();
                if (convoError) throw convoError;
                conversationId = created.id;
            }

            // Insert the offer
            const { data: offer, error: offerError } = await supabase
                .from("offers")
                .insert({
                    listing_id: listingId,
                    buyer_id: user.id,
                    seller_id: sellerId,
                    amount: Number(offerAmount),
                    status: "pending",
                })
                .select("id")
                .single();
            if (offerError) throw offerError;

            // Insert a linked message so it appears in chat
            const { error: msgError } = await supabase
                .from("messages")
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    body: `Offer: $${Number(offerAmount).toLocaleString()}`,
                    offer_id: offer.id,
                });
            if (msgError) throw msgError;

            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        setOpen(false);
        setSubmitted(false);
        setOfferAmount("");
        setError(null);
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full rounded-xl bg-[#FEF08A] py-3 md:py-4 text-lg md:text-2xl font-semibold text-black shadow-sm transition hover:bg-[#fde047]"
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
                                <button
                                    onClick={handleClose}
                                    className="mt-2 w-full rounded-xl bg-[#3567F1] py-3 text-lg font-semibold text-white hover:bg-[#2f5de0] transition"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
                                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                                </div>

                                <p className="text-gray-500 text-sm">
                                    Listed price: <span className="font-semibold text-gray-800">${Number(listingPrice).toLocaleString()}</span>
                                </p>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        required
                                        value={offerAmount}
                                        onChange={(e) => setOfferAmount(e.target.value)}
                                        placeholder="Enter your offer"
                                        className="w-full rounded-xl border-2 border-gray-200 py-3 pl-8 pr-4 text-lg focus:border-[#3567F1] focus:outline-none"
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-[#FEF08A] py-3 text-lg font-semibold text-black hover:bg-[#fde047] transition disabled:opacity-50"
                                >
                                    {loading ? "Sending…" : "Send Offer"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
