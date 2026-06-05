"use client";

import { Flag } from "lucide-react";
import { useAuth } from "./AuthProvider";

// ReportButton component renders a button that allows users to report a product listing.
export default function ReportButton({ sellerId, className }: { sellerId: string; className?: string }) {
    const { user } = useAuth();
    if (user?.id === sellerId) return null;

    return (
        <button className={className ?? "flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition cursor-pointer"}>
            <Flag size={15} />
            Report
        </button>
    );
}
