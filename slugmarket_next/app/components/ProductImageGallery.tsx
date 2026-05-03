"use client";

import { useState } from "react";
import { Heart, Bookmark } from "lucide-react"

type ProductImageGalleryProps = {
  images: string[];
  title: string;
};

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHeartActive, setIsHeartActive] = useState(false)
  const [isBookmarkActive, setIsBookmarkActive] = useState(false)

  const currentImage = images[currentIndex]

  function goPrevious() {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }

  function goNext() {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        <img
          src={currentImage}
          alt={title}
          className="aspect-square w-full object-cover"
        />

        {/* Bookmark Button */}
        <div className="absolute right-4 top-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setIsBookmarkActive(!isBookmarkActive)}
            className="rounded-full bg-white/90 p-3 shadow-md backdrop-blur-sm transition hover:scale-105"
            aria-label="Toggle bookmark"
          >
                        
            <Bookmark className={`h-6 w-6 transition ${isBookmarkActive ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
          </button>

        </div>

        {/* prev and next buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 shadow-md backdrop-blur-sm transition hover:scale-105 flex items-center justify-center text-2xl"
            >
              ◀
            </button>

            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 shadow-md backdrop-blur-sm transition hover:scale-105 flex items-center justify-center text-2xl"
            >
              ▶
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <p className="mt-3 text-sm text-gray-600">
          {currentIndex + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
