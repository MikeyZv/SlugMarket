import { supabase } from "@/lib/supabase";
import { fetchProductsBySellerId, fetchSoldListingsBySellerId } from "@/lib/fetchProducts";
import ProfileTabs from "../../components/ProfileTabs";
import AvatarUpload from "../../components/AvatarUpload";
import EditProfile from "../../components/EditProfile";
import { Star } from "lucide-react";

// ProfilePage component is responsible for rendering the user's profile page.
// It retrieves the username from the URL parameters, looks up the user's profile information from the database, and fetches their active and sold listings.
// The page displays the user's avatar, username, and tabs for their active and sold listings. 
// If the user is not found, it shows a "User not found" message.
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Look up the user's ID from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, avatar_url, bio, college")
    .eq("username", username)
    .single();

  // Fetch active and sold listings if the profile exists
  const [listings, soldListings] = profile
    ? await Promise.all([
        fetchProductsBySellerId(profile.id),
        fetchSoldListingsBySellerId(profile.id),
      ])
    : [[], []];

  // Batch-fetch buyer usernames for sold listings that have a buyer_id
  const buyerIds = (soldListings ?? [])
    .map((l) => l.buyer_id)
    .filter((id): id is string => !!id);

  let buyerUsernames: Record<string, string> = {};
  if (buyerIds.length > 0) {
    const { data: buyers } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", buyerIds);
    for (const b of buyers ?? []) {
      buyerUsernames[b.id] = b.username;
    }
  }

  // Get average review rating for profile
  // Fetch average rating for this user
  let averageRating: number | null = null;

  if (profile) {
    const { data: ratingRows } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewed_user_id", profile.id);

    if (ratingRows && ratingRows.length > 0) {
      const sum = ratingRows.reduce((acc, r) => acc + r.rating, 0);
      averageRating = sum / ratingRows.length;
    }
  }


 // Render the profile page with the user's listings and sold items
  return (
    <main className="w-full max-w-4xl mx-auto px-6 py-12">
      {/* Profile card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-8">
        {/* Banner */}
        <div className="h-24 bg-[#0F2044]" />

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-3">
            <AvatarUpload
              profileId={profile?.id ?? ""}
              username={username}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">@{username}</h1>

          {averageRating !== null && (
            <div className="flex items-center gap-1 mt-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(averageRating!) ? "fill-[#F5C518] text-[#F5C518]" : "fill-gray-200 text-gray-200"}
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">{averageRating.toFixed(1)}</span>
            </div>
          )}

          <EditProfile profileId={profile?.id ?? ""} initialBio={profile?.bio ?? null} initialCollege={profile?.college ?? null} />
        </div>
      </div>

      {!profile ? (
        <p className="text-gray-400 italic">User not found.</p>
      ) : (
        <ProfileTabs listings={listings ?? []} soldListings={soldListings ?? []} profileId={profile.id} buyerUsernames={buyerUsernames} />
      )}
    </main>
  );
}
