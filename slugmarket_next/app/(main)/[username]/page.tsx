import { supabase } from "@/lib/supabase";
import { fetchProductsBySellerId, fetchSoldListingsBySellerId } from "@/lib/fetchProducts";
import ProfileTabs from "../../components/ProfileTabs";

// The username is pulled from the URL segment, e.g. /johndoe -> params.username = "johndoe"
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Look up the user's ID from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  // Fetch active and sold listings if the profile exists
  const [listings, soldListings] = profile
    ? await Promise.all([
        fetchProductsBySellerId(profile.id),
        fetchSoldListingsBySellerId(profile.id),
      ])
    : [[], []];

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Profile header */}
      <div className="flex items-center gap-6 mb-10">
        {/* Avatar placeholder */}
        <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-3xl font-bold text-white">
          {username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">@{username}</h1>
          <p className="text-gray-500 text-sm mt-1">UCSC Student</p>
        </div>
      </div>

      {!profile ? (
        <p className="text-gray-400 italic">User not found.</p>
      ) : (
        <ProfileTabs listings={listings ?? []} soldListings={soldListings ?? []} />
      )}
    </main>
  );
}
