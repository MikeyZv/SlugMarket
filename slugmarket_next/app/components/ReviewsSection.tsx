"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReviewsSection({ profileId }: { profileId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      //
      // 1. Fetch reviews for this profile
      //
      const { data: reviewRows, error: reviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("reviewed_user_id", profileId)
        .order("created_at", { ascending: false });

      if (reviewError) {
        console.error("Review fetch error:", reviewError);
        setLoading(false);
        return;
      }

      if (!reviewRows || reviewRows.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      //
      // 2. Extract reviewer_ids
      //
      const reviewerIds = reviewRows.map((r) => r.reviewer_id);

      //
      // 3. Fetch profiles for those reviewers
      //
      const { data: profileRows, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", reviewerIds);

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setLoading(false);
        return;
      }

      //
      // 4. Map profiles by id
      //
      const profileMap = Object.fromEntries(
        profileRows.map((p) => [p.id, p])
      );

      //
      // 5. Merge reviews with reviewer profile info
      //
      const merged = reviewRows.map((r) => ({
        ...r,
        reviewer: profileMap[r.reviewer_id] || null,
      }));

      setReviews(merged);
      setLoading(false);
    }

    load();

    function handleRefresh(e: Event) {
      const { profileId: id } = (e as CustomEvent).detail
      if (id === profileId) load()
    }

    window.addEventListener("review-submitted", handleRefresh)
    return () => window.removeEventListener("review-submitted", handleRefresh)
  }, [profileId]);

  if (loading) {
    return <p className="text-gray-400 italic">Loading reviews…</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-gray-400 italic">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div
          key={r.review_id}
          className="border p-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold">
              @{r.reviewer?.username || "Unknown"}
            </p>
            <span className="text-yellow-500">⭐ {r.rating}</span>
          </div>

          <p className="text-gray-700">{r.review_text}</p>

          <p className="text-xs text-gray-400 mt-1">
            {new Date(r.created_at).toLocaleDateString()}
          </p>

          {r.listing_id && (
            <p className="text-xs text-gray-500 mt-1">
              Related listing:{" "}
              <a
                href={`/products/${r.listing_id}`}
                className="underline hover:text-gray-700"
              >
                View
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
