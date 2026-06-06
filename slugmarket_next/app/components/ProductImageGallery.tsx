"use client";

import { useEffect, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type ProductImageGalleryProps = {
  images: string[];
  title: string;
  product_id: string;
};

// This component renders a product image gallery with next/previous buttons and a bookmark toggle. 
// It also checks if the current user has bookmarked the product and allows toggling the bookmark state.
export default function ProductImageGallery({ images, title, product_id }: ProductImageGalleryProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isBookmarkActive, setIsBookmarkActive] = useState(false)

  const currentImage = images[currentIndex]

  // Initial state of bookmark
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsBookmarkActive(false);
      return;
    }

    // when loading is finished and user is actually logged in
    let cancelled = false;

    async function checkBookmarkExists() {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("product_id")
        .eq("user_id", user?.id)
        .eq("product_id", product_id)
        .maybeSingle();

      if (!cancelled && !error && data) setIsBookmarkActive(true);
    };

    checkBookmarkExists()

    return () => {
      cancelled = true;
    }
  }, [authLoading, user, product_id])

  // Toggle bookmark state and update database accordingly
  async function toggleBookmark() {
    if (authLoading) return;
    if (!user) {
      router.push(`/signin?next=/products/${encodeURIComponent(product_id)}`)
      return
    }

    const nextState = !isBookmarkActive
    setIsBookmarkActive(nextState)

    if (nextState) {
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user?.id,
        product_id
      })

      if (error) {
        setIsBookmarkActive(false)
        console.error(error)
      }
    } else {
      const { error } = await supabase.from("bookmarks").delete().eq("user_id", user?.id).eq("product_id", product_id)
      
      if (error) {
        setIsBookmarkActive(true)
        console.error(error)
      }
    }
  }

  // Handlers for next and previous buttons with wrap-around logic
  function goPrevious() {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function goNext() {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
            onClick={toggleBookmark}
            className="rounded-full bg-black/20 p-3 backdrop-blur-sm transition hover:bg-black/30 hover:scale-105 cursor-pointer"
            aria-label="Toggle bookmark"
          >
            <Bookmark className={`h-6 w-6 transition ${isBookmarkActive ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>

        </div>

        {/* prev and next buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center transition backdrop-blur-sm cursor-pointer"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center transition backdrop-blur-sm cursor-pointer"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
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
