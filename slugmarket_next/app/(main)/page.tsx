import ListingCard, { mockListings } from "../components/ListingCard"

export default function HomePage() {
  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SlugMarket</h1>
        <p className="text-gray-500 text-lg mb-8">
          Buy and sell with fellow UCSC students.
        </p>
        {mockListings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
      </main>
    </>
  )
}