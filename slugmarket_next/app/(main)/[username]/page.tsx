import { supabase } from "@/lib/supabase";
import { fetchProductsBySellerId, fetchSoldListingsBySellerId } from "@/lib/fetchProducts";
import ProfileTabs from "../../components/ProfileTabs";
import AvatarUpload from "../../components/AvatarUpload";

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
    .select("id, avatar_url")
    .eq("username", username)
    .single();

  // Fetch active and sold listings if the profile exists
  const [listings, soldListings] = profile
    ? await Promise.all([
        fetchProductsBySellerId(profile.id),
        fetchSoldListingsBySellerId(profile.id),
      ])
    : [[], []];
 // Render the profile page with the user's listings and sold items
  return (
    <main className="w-full max-w-4xl mx-auto px-6 py-12">
      {/* Profile header */}
      <div className="flex items-center gap-6 mb-10">
        <AvatarUpload
          profileId={profile?.id ?? ""}
          username={username}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">@{username}</h1>
          <p className="text-gray-500 text-sm mt-1">UCSC Student</p>
        </div>
      </div>

      {!profile ? (
        <p className="text-gray-400 italic">User not found.</p>
      ) : (
        <ProfileTabs listings={listings ?? []} soldListings={soldListings ?? []} profileId={profile.id} />
      )}
    </main>
  );
}
