"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { revalidateListings } from "@/app/actions/listings";

type DeleteButtonProps = {
    productId: string;
    sellerId: string;
    imageUrls: string[];
};

// This component renders a delete button for a product listing. It checks if the current user is the seller before rendering.
export default function DeleteButton({ productId, sellerId, imageUrls }: DeleteButtonProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    if (user?.id !== sellerId) return null;

    async function handleDelete() {
        setLoading(true);

        // Extract storage paths from public URLs and delete from storage
        const BUCKET = "listing-images";
        const marker = `/${BUCKET}/`;
        const filePaths = imageUrls
            .map((url) => {
                const idx = url.indexOf(marker);
                if (idx === -1) return null;
                const path = url.slice(idx + marker.length).split("?")[0];
                return path || null;
            })
            .filter((p): p is string => p !== null);

        console.log("[DeleteButton] image paths to remove:", filePaths);

        if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage.from(BUCKET).remove(filePaths);
            if (storageError) console.error("[DeleteButton] storage removal error:", storageError);
        }

        const { error } = await supabase.from("product_listings").delete().eq("id", productId);
        if (error) {
            setLoading(false);
            setShowModal(false);
            return;
        }
        await revalidateListings();
        router.push("/");
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full rounded-xl border-2 border-red-500 bg-white py-4 text-2xl font-semibold text-red-500 transition hover:bg-red-50"
            >
                Delete Listing
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col gap-6 shadow-xl">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete listing?</h2>
                            <p className="text-gray-600">This action cannot be undone. The listing will be permanently removed.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="w-full rounded-xl bg-red-500 py-3 text-lg font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                                {loading ? "Deleting..." : "Yes, delete it"}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 text-lg font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
