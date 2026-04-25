import ListingCard, { mockListings } from "../components/ListingCard"
import { fetchProducts } from "@/lib/fetchProducts";

export default async function HomePage() {
  const products = await fetchProducts();
  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SlugMarket</h1>
        <p className="text-gray-500 text-lg mb-8">
          Buy and sell with fellow UCSC students.
        </p>
        <p className="text-gray-400 italic">Listings will appear here soon.</p>
         {products.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))} 
      </main>
    </>
  )
}