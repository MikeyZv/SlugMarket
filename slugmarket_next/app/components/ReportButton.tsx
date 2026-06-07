"use client";

import { Flag, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type Props = { listingId: string; sellerId: string; className?: string };

const REASONS = [
    "Prohibited or illegal item",
    "Spam or scam",
    "Inappropriate content",
    "Misleading or fake listing",
    "Other",
];

// ReportButton lets a user flag a listing. It opens a modal with a reason
// dropdown plus an optional details field, and inserts a row into the `reports`
// table. Hidden from the listing's own seller.
export default function ReportButton({ listingId, sellerId, className }: Props) {
    const { user } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState(REASONS[0]);
    const [reasonOpen, setReasonOpen] = useState(false);
    const reasonRef = useRef<HTMLDivElement>(null);
    const [details, setDetails] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (reasonRef.current && !reasonRef.current.contains(e.target as Node)) {
                setReasonOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (user?.id === sellerId) return null;

    function handleClose() {
        setOpen(false); setSubmitted(false); setReason(REASONS[0]); setDetails(""); setError(null);
    }

    async function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault();
        if (!user) { router.push("/signin"); return; }
        setLoading(true);
        setError(null);
        try {
            const { error: insertError } = await supabase.from("reports").insert({
                listing_id: listingId,
                seller_id: sellerId,
                reporter_id: user.id,
                reason,
                details: details.trim() || null,
            });
            if (insertError) throw insertError;
            setSubmitted(true);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message
                : typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: unknown }).message)
                : null;
            setError(message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => { if (!user) { router.push("/signin"); return; } setOpen(true); }}
                className={className ?? "flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"}
            >
                <Flag size={15} />
                Report
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                        {submitted ? (
                            <div className="flex flex-col items-center gap-4 py-4">
                                <div className="text-4xl">✓</div>
                                <p className="text-xl font-semibold text-gray-900">Report submitted</p>
                                <p className="text-gray-500 text-center">Thanks for helping keep SlugMarket safe. Our team will review this listing.</p>
                                <button onClick={handleClose} className="mt-2 w-full rounded-xl bg-[#0F2044] py-3 text-lg font-semibold text-white hover:bg-[#162d5a] transition cursor-pointer">Done</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Report listing</h2>
                                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer">&times;</button>
                                </div>
                                <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                    Reason
                                    <div className="relative" ref={reasonRef}>
                                        <button
                                            type="button"
                                            onClick={() => setReasonOpen((v) => !v)}
                                            className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2044] focus:border-transparent transition cursor-pointer"
                                        >
                                            <span className="text-gray-900">{reason}</span>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${reasonOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        {reasonOpen && (
                                            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                {REASONS.map((r) => (
                                                    <li key={r}>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setReason(r); setReasonOpen(false); }}
                                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#0F2044]/5 transition cursor-pointer"
                                                        >
                                                            <span className="flex-1 text-left">{r}</span>
                                                            {reason === r && <Check size={14} className="text-[#0F2044] shrink-0" />}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                    Details <span className="font-normal text-gray-400">(optional)</span>
                                    <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} maxLength={1000} placeholder="Add any additional context…" className="w-full rounded-xl border-2 border-gray-200 py-3 px-4 text-base resize-none focus:border-[#0F2044] focus:outline-none" />
                                </label>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#F5C518] py-3 text-lg font-semibold text-[#0F2044] hover:bg-[#fde047] transition disabled:opacity-50 cursor-pointer">{loading ? "Submitting…" : "Submit report"}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
