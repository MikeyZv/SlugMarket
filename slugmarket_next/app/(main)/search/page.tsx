import ListingCard from "@/app/components/ListingCard";
import NavSearchBar from "@/app/components/NavSearchBar";
import { fetchProductByQuery } from "@/lib/fetchProducts";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const query = q ?? "";

    const results = await fetchProductByQuery(query);

    return (
        <main className="max-w-5xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold text-gray-900">Search</h1>

            {/* Search bar visible on mobile only */}
            <div className="min-[770px]:hidden mt-4">
                <NavSearchBar />
            </div>

            {query.trim() ? (
                <p className="text-gray-500 mt-2">
                    Showing results for &ldquo;{query}&rdquo;
                </p>
            ) : (
                <p className="text-gray-500 mt-2">Type a search to begin.</p>
            )}
            <div className="grid grid-cols-1 min-[770px]:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 auto-rows-fr">
                {(results ?? []).map((listing, index) => (
                    <ListingCard key={listing.id} listing={listing} priority={index === 0} />
                ))}
            </div>
        </main>
    );
}