"use client" // Required for useState, useRef, and event handlers

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../../../components/AuthProvider"

// Fixed list of allowed condition values for a listing
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'] as const
// Derive the union type from the array so it stays in sync automatically
type Condition = typeof CONDITIONS[number]

type SelectedImage = {
  file: File;
  url: string;
};

// Shape of the form
interface ListingForm {
  title: string
  price: string
  description: string
  condition: Condition | ''
}

export default function CreateListingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin")
    }
  }, [loading, user, router])

  // All form field values tracked as a single state object
  const [form, setForm] = useState<ListingForm>({
    title: '',
    price: '',
    description: '',
    condition: '',
  })

  // Object URL for the selected image, used to show a local preview before upload
  //const [preview, setPreview] = useState<string[] | null>(null)
  // Prevents double-submission and disables the submit button while the request is in flight
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  // Holds any error message surfaced to the user
  const [error, setError] = useState<string | null>(null)
  // Ref to the hidden <input type="file"> so the styled drop-zone div can trigger it
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<SelectedImage[]>([])

  // Generic change handler shared by text inputs, textarea, and select.
  // Uses the element's `name` attribute as the form key, so no per-field handler is needed.
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Stores the selected File object in form state and generates a temporary
  // object URL so the image can be previewed locally without uploading first.
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const next = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...next]);

    // important: reset so selecting the same file again triggers onChange
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url) // avoid mem leaks

      const copy = prev.slice();
      copy.splice(index, 1);

      return copy;
    });
  }

  // Handles form submission: uploads the image (if any), then inserts the listing row.
  async function handleSubmit(e: React.SubmitEvent) {
    if (!user) {
      router.replace("/signin");
      return;
    }
    
    e.preventDefault()

    if (images.length === 0) {
      setError("Please add at least one photo")
      return
    }
    
    setLoadingSubmit(true)
    setError(null)

    try {
      // Upload image to Supabase Storage if the user selected one
      let image_urls: string[] = []
      const files = images.map((x) => x.file)

      if (files.length > 0) {
        const uploads = await Promise.all(
          files.map(async (file) => {
            const ext = file.name.split('.').pop()
            const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`
            const { error: uploadError } = await supabase.storage
              .from("listing-images")
              .upload(fileName, file);
            if (uploadError) throw new Error(uploadError.message)
            const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(fileName)

            return publicUrl
          })
        )

        image_urls = uploads
      }

      // Insert the listing record; price is stored as a float, not a string
      const { error: insertError } = await supabase.from('product_listings').insert({
        title: form.title,
        price: parseFloat(form.price),
        description: form.description,
        condition: form.condition,
        image_urls,
        seller_id: user.id,
      })
      if (insertError) throw new Error(insertError.message)

      // Redirect to the products listing page on success
      router.push('/')
    } catch (err: unknown) {
      // Narrow the unknown error to extract a human-readable message
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      console.error('Listing insert error:', message)
      setError(message)
    } finally {
      // Always re-enable the submit button regardless of success or failure
      setLoadingSubmit(false)
    }
  }

  if (loading || !user) {
    return null
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Listing</h1>
      <p className="text-gray-500 mb-8">Fill in the details about what you're selling.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Calculus Textbook 9th Edition"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your item — include any relevant details like edition, size, color, etc."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
          />
        </div>

        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            required
            value={form.condition}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
          >
            <option value="" disabled>Select a condition…</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div className="grid grid-cols-3 gap-3">
          {images.length > 0 &&
            images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img.url} alt={`Photo ${i+1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-2 top-2 h-7 w-7 rounded-full bg-white/90 shadow grid place-items-center"
                >
                  x
                </button>
              </div>
            ))
          }

          {images.length < 9 && <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-yellow-400 transition-colors place-items-center"
          >
            <span className="text-gray-400 text-sm">Add photo</span>
            <p className="text-gray-300 text-xs mt-1">PNG, JPG, WEBP up to 10 MB</p>
          </button>}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Submit */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loadingSubmit}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-lg transition-colors text-base"
        >
          {loadingSubmit ? 'Posting…' : 'Post Listing'}
        </button>
      </form>
    </main>
  )
}
