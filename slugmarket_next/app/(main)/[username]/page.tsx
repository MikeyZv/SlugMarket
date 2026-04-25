import ListingCard, { mockListings } from "../../components/ListingCard";

// The username is pulled from the URL segment, e.g. /johndoe -> params.username = "johndoe"
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

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

      {/* Listings section */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Listings</h2>
      {mockListings.length === 0 ? (
        <p className="text-gray-400 italic">No listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mockListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
