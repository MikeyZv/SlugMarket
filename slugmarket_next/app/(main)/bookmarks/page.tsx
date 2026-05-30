"use client";

import { useEffect, useState } from "react";
import ListingCard from "@/app/components/ListingCard";
import { fetchBookmarkedProducts } from "@/lib/fetchProducts";
import { useAuth } from "@/app/components/AuthProvider";
import { Listing } from "@/lib/types";

// This page displays the user's bookmarked items. 
// It fetches the bookmarked products from the database when the component mounts and handles loading states and user authentication. 
// If the user is not signed in, it prompts them to sign in to view their bookmarks.
export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Listing[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Function to load bookmarked products for the authenticated user.
    async function loadBookmarks() {
      if (!user) {
        setProducts([]);
        setPageLoading(false);
        return;
      }

      try {
        const bookmarkedProducts = await fetchBookmarkedProducts(user.id);
        setProducts(bookmarkedProducts);
      } catch (error) {
        console.error("Error loading bookmarked products:", error);
        setProducts([]);
      } finally {
        setPageLoading(false);
      }
    }

    // Load bookmarks once the user is authenticated and not loading.
    if (!loading) {
      loadBookmarks();
    }
  }, [user, loading]);

  if (loading || pageLoading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">Bookmarked Items</h1>
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">Bookmarked Items</h1>
        <p className="text-gray-600">Please sign in to view your bookmarked items.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Bookmarked Items</h1>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          You have no bookmarked items yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 min-[770px]:grid-cols-2 lg:grid-cols-4">
          {products.map((listing, index) => (
            <ListingCard key={listing.id} listing={listing} priority={index === 0} />
          ))}
        </div>
      )}
    </main>
  );
}