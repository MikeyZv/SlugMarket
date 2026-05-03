"use client";

import { useEffect, useState } from "react";
import { Heart, Bookmark } from "lucide-react"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type ProductImageGalleryProps = {
  images: string[];
  title: string;
  product_id: string;
};

export default function ProductImageGallery({ images, title, product_id }: ProductImageGalleryProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHeartActive, setIsHeartActive] = useState(false)
  const [isBookmarkActive, setIsBookmarkActive] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(true)

  const currentImage = images[currentIndex]

  // Initial state of bookmark
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsBookmarkActive(false);
      setBookmarkLoading(false);
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

      if (!cancelled) {
        // sets bookmark toggle as true if user already bookmarked before
        if (!error && data) setIsBookmarkActive(true);
        setBookmarkLoading(false)
      }
    };

    checkBookmarkExists()

    return () => {
      cancelled = true;
    }
  }, [authLoading, user, product_id])

  async function toggleBookmark() {
    if (authLoading) return;
    if (!user) {
      router.push(`/signin?next=/products/${encodeURIComponent(product_id)}`)
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
