"use client";

import { useState } from "react";
import ListingCard from "./ListingCard";
import { Listing } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import { fetchBookmarkedProducts } from "@/lib/fetchProducts";

type Props = {
  listings: Listing[];
  soldListings: Listing[];
  profileId: string;
};

export default function ProfileTabs({ listings, soldListings, profileId }: Props) {
  const { user } = useAuth();
  const isOwnProfile = !!user && user.id === profileId;
  const [activeTab, setActiveTab] = useState<"active" | "sold" | "bookmarks">("active");
  const [bookmarks, setBookmarks] = useState<Listing[]>([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  async function handleBookmarksTab() {
    setActiveTab("bookmarks");
    if (!bookmarksLoaded) {
      setBookmarksLoading(true);
      const data = await fetchBookmarkedProducts(profileId);
      setBookmarks(data as Listing[]);
      setBookmarksLoaded(true);
      setBookmarksLoading(false);
    }
  }

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-2 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "active"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Listings
          {listings.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {listings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("sold")}
          className={`px-6 py-2 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === "sold"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Sold
          {soldListings.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {soldListings.length}
            </span>
          )}
        </button>

        {/* Saved tab — mobile only, own profile only */}
        {isOwnProfile && (
          <button
            onClick={handleBookmarksTab}
            className={`sm:hidden px-6 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "bookmarks"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Saved
          </button>
        )}
      </div>

      {/* Tab content */}
      {activeTab === "bookmarks" ? (
        bookmarksLoading ? (
          <p className="text-gray-400 italic">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <p className="text-gray-400 italic">No saved items.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bookmarks.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )
      ) : activeTab === "active" ? (
        listings.length === 0 ? (
          <p className="text-gray-400 italic">No active listings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )
      ) : soldListings.length === 0 ? (
          <p className="text-gray-400 italic">No sold listings.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {soldListings.map((listing) => (
            <div key={listing.id} className="relative opacity-60">
              <ListingCard listing={listing} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/70 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  Sold
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
