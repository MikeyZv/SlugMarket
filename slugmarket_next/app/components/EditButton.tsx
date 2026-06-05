"use client";

import Link from "next/link"
import { Pencil } from "lucide-react"
import { useAuth } from "./AuthProvider"

type EditButtonProps = {
    productId: string;
    sellerId: string;
    className?: string;
}

export default function EditButton({ productId, sellerId, className }: EditButtonProps) {
    const { user } = useAuth()

    if (user?.id !== sellerId) return null

    return (
        <Link
            href={`/products/edit/${productId}`}
            className={className ?? "flex items-center justify-center gap-2 w-full rounded-xl border-2 border-[#0F2044] bg-white px-6 py-3 text-sm font-semibold text-[#0F2044] transition hover:bg-[#0F2044]/5"}
        >
            <Pencil size={16} />
            Edit
        </Link>
    )
}