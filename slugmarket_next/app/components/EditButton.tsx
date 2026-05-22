"use client";

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type EditButtonProps = {
    productId: string;
    sellerId: string;
}

// This component renders an edit button for a product listing. It checks if the current user is the seller before rendering.
export default function EditButton({ productId, sellerId }: EditButtonProps) {
    const [isOwner, setIsOwner] = useState(false)

    useEffect(() => {
        supabase.auth.getUser().then(({ data}) => {
            if (data.user?.id === sellerId) setIsOwner(true)
        })
    }, [sellerId])

    if (!isOwner) return null

    return (
        <Link
            href={`/products/edit/${productId}`}
            className="block w-full rounded-xl border-2 border-black bg-white py-4 text-center text-2xl font-semibold text-black transition hover:bg-gray-50"
        >
            Edit Listing
        </Link>
    )
}