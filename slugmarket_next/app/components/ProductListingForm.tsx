"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"
import { revalidateListings } from "@/app/actions/listings"
import { CONDITIONS, type ListingForm, type ListingImage, type LocalImage } from "@/lib/types"
import { uploadLocals } from "@/lib/uploadImages"
import ImageUploadGrid from "./ImageUploadGrid"

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
    return (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
        </div>
    )
}

export type ProductListingFormProps = {
    mode: "create" | "edit"
    listingId?: string
    initialForm?: ListingForm
    initialImageUrls?: string[]
}

export default function ProductListingForm({ mode, listingId, initialForm, initialImageUrls = [] }: ProductListingFormProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) router.replace("/signin")
    }, [loading, user, router])

    const [form, setForm] = useState<ListingForm>({
        title: initialForm?.title ?? "",
        price: initialForm?.price ?? "",
        description: initialForm?.description ?? "",
        condition: initialForm?.condition ?? "",
    })
    const [images, setImages] = useState<ListingImage[]>(
        initialImageUrls.map((url) => ({ kind: "remote", url }))
    )
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function addImages(files: File[]) {
        const next: LocalImage[] = files.map((file) => ({ kind: "local", file, url: URL.createObjectURL(file) }))
        setImages((prev) => [...prev, ...next])
    }

    function removeImage(index: number) {
        setImages((prev) => {
            const removed = prev[index]
            if (removed?.kind === "local") URL.revokeObjectURL(removed.url)
            const copy = prev.slice()
            copy.splice(index, 1)
            return copy
        })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user) { router.replace("/signin"); return }
        if (images.length === 0) { setError("Please add at least one photo"); return }
        if (mode === "edit" && !listingId) { setError("Missing listing id"); return }

        setLoadingSubmit(true)
        setError(null)

        try {
            const remoteUrls = images.filter((img) => img.kind === "remote").map((img) => img.url)
            const localFiles = images.flatMap((img): File[] => img.kind === "local" ? [(img as LocalImage).file] : [])
            const image_urls = [...remoteUrls, ...await uploadLocals(localFiles, user.id)]
            const row = { title: form.title, price: parseFloat(form.price), description: form.description, condition: form.condition, image_urls }

            if (mode === "create") {
                const { data: inserted, error: insertError } = await supabase
                    .from("product_listings").insert({ ...row, seller_id: user.id }).select("id").single()
                if (insertError) throw new Error(insertError.message)
                await revalidateListings()
                router.push(`/products/${inserted.id}`)
            } else {
                const { error: updateError } = await supabase
                    .from("product_listings").update(row).eq("id", listingId).eq("seller_id", user.id)
                if (updateError) throw new Error(updateError.message)
                await revalidateListings()
                router.push(`/products/${listingId}`)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong.")
        } finally {
            setLoadingSubmit(false)
        }
    }

    if (loading || !user) return null

    const heading = mode === "create" ? "Post a Listing" : "Edit Listing"
    const subtitle = mode === "create" ? "Fill in the details about what you're selling." : "Update your listing details."
    const submitLabel = mode === "create" ? (loadingSubmit ? "Posting..." : "Post Listing") : (loadingSubmit ? "Saving..." : "Save changes")

    return (
        <main className="max-w-2xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{heading}</h1>
            <p className="text-gray-500 mb-8">{subtitle}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Title" htmlFor="title">
                    <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} placeholder="e.g. Calculus Textbook 9th Edition" className={inputCls} />
                </Field>
                <Field label="Price" htmlFor="price">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                        <input id="price" name="price" type="number" required min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" className={`${inputCls} pl-8`} />
                    </div>
                </Field>
                <Field label="Description" htmlFor="description">
                    <textarea id="description" name="description" required rows={4} value={form.description} onChange={handleChange} placeholder="Describe your item — include any relevant details like edition, size, color, etc." className={`${inputCls} resize-none`} />
                </Field>
                <Field label="Condition" htmlFor="condition">
                    <select id="condition" name="condition" required value={form.condition} onChange={handleChange} className={`${inputCls} bg-white`}>
                        <option value="" disabled>Select a condition…</option>
                        {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>
                <ImageUploadGrid images={images} onAdd={addImages} onRemove={removeImage} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loadingSubmit} className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-lg transition-colors text-base">
                    {submitLabel}
                </button>
            </form>
        </main>
    )
}
