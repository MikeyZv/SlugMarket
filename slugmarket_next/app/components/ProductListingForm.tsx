"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"
import { revalidateListings } from "@/app/actions/listings"
import { CONDITIONS, CATEGORIES, type ListingForm, type ListingImage, type LocalImage } from "@/lib/types"
import { uploadLocals } from "@/lib/uploadImages"
import ImageUploadGrid from "./ImageUploadGrid"

const inputCls = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F2044] focus:border-transparent"

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
        category: initialForm?.category ?? "",
    })
    const [images, setImages] = useState<ListingImage[]>(
        initialImageUrls.map((url) => ({ kind: "remote", url }))
    )
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [conditionOpen, setConditionOpen] = useState(false)
    const conditionRef = useRef<HTMLDivElement>(null)
    const [categoryOpen, setCategoryOpen] = useState(false)
    const categoryRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (conditionRef.current && !conditionRef.current.contains(e.target as Node)) {
                setConditionOpen(false)
            }
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setCategoryOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
            const row = { title: form.title, price: parseFloat(form.price), description: form.description, condition: form.condition, 
                category: form.category, image_urls }

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
                <div>
                    <label id="condition-label" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <div className="relative" ref={conditionRef}>
                        <button
                            type="button"
                            aria-labelledby="condition-label"
                            onClick={() => setConditionOpen((v) => !v)}
                            className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2044] focus:border-transparent transition cursor-pointer"
                        >
                            <span className={form.condition ? "text-gray-900" : "text-gray-400"}>
                                {form.condition || "Select a condition…"}
                            </span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${conditionOpen ? "rotate-180" : ""}`} />
                        </button>
                        {conditionOpen && (
                            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                {CONDITIONS.map((c) => (
                                    <li key={c}>
                                        <button
                                            type="button"
                                            onClick={() => { setForm((prev) => ({ ...prev, condition: c })); setConditionOpen(false) }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#0F2044]/5 transition cursor-pointer"
                                        >
                                            <span className="flex-1 text-left">{c}</span>
                                            {form.condition === c && <Check size={14} className="text-[#0F2044] shrink-0" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <div>
                <label id="category-label" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                </label>

                <div className="relative" ref={categoryRef}>
                    <button
                        type="button"
                        aria-labelledby="category-label"
                        onClick={() => setCategoryOpen(v => !v)}
                        className="w-full flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2044] focus:border-transparent transition cursor-pointer"
                    >
                        <span className={form.category ? "text-gray-900" : "text-gray-400"}>
                            {form.category || "Select a category…"}
                        </span>
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {categoryOpen && (
                        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            {CATEGORIES.map((cat) => (
                                <li key={cat}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, category: cat }))
                                            setCategoryOpen(false)
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#0F2044]/5 transition cursor-pointer"
                                    >
                                        <span className="flex-1 text-left">{cat}</span>
                                        {form.category === cat && (
                                            <Check size={14} className="text-[#0F2044] shrink-0" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

                <ImageUploadGrid images={images} onAdd={addImages} onRemove={removeImage} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loadingSubmit} className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-lg transition-colors text-base cursor-pointer">
                    {submitLabel}
                </button>
            </form>
        </main>
    )
}
