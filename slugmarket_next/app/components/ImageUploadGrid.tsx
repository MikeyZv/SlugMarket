"use client"

import { useRef } from "react"
import type { ListingImage } from "@/lib/types"

type Props = {
    images: ListingImage[]
    onAdd: (files: File[]) => void
    onRemove: (index: number) => void
}

export default function ImageUploadGrid({ images, onAdd, onRemove }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? [])
        if (files.length > 0) onAdd(files)
        e.target.value = ""
    }

    return (
        <div className="grid grid-cols-3 gap-3">
            {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={img.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="absolute right-2 top-2 h-7 w-7 rounded-full bg-white/90 shadow grid place-items-center"
                    >
                        x
                    </button>
                </div>
            ))}
            {images.length < 9 && (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-yellow-400 transition-colors place-items-center"
                >
                    <span className="text-gray-400 text-sm">Add photo</span>
                </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleChange} className="hidden" />
        </div>
    )
}
