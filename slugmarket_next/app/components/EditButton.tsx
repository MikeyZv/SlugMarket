"use client";

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type EditButtonProps = {
    productId: string;
    sellerId: string;
}

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
            className="block w-full rounded-xl border-2 border-black bg-white py-4 text-center text-xl font-semibold text-black transition hover:bg-gray-50"
        >
            Edit Listing
        </Link>
    )
}