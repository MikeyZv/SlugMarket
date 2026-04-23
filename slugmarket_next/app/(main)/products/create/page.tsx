"use client"

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'] as const
type Condition = typeof CONDITIONS[number]

interface ListingForm {
  title: string
  price: string
  description: string
  condition: Condition | ''
  image: File | null
}

export default function CreateListingPage() {
  const router = useRouter()
  const [form, setForm] = useState<ListingForm>({
    title: '',
    price: '',
    description: '',
    condition: '',
    image: null,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setForm((prev) => ({ ...prev, image: file }))
    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Upload image to storage if provided
      let image_url: string | null = null
      if (form.image) {
        const ext = form.image.name.split('.').pop()
        const fileName = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, form.image)
        if (uploadError) throw new Error(uploadError.message)
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)
        image_url = publicUrl
      }

      const { error: insertError } = await supabase.from('listings').insert({
        title: form.title,
        price: parseFloat(form.price),
        description: form.description,
        condition: form.condition,
        image_url,
      })
      if (insertError) throw new Error(insertError.message)

      router.push('/products')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      console.error('Listing insert error:', message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 bg-white-100">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
            ) : (
              <>
                <p className="text-gray-400 text-sm">Click to upload a photo</p>
                <p className="text-gray-300 text-xs mt-1">PNG, JPG, WEBP up to 10 MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setForm((prev) => ({ ...prev, image: null }))
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="mt-2 text-xs text-red-500 hover:text-red-700"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Submit */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-semibold py-3 rounded-lg transition-colors text-base"
        >
          {loading ? 'Posting…' : 'Post Listing'}
        </button>
      </form>
    </main>
  )
}
