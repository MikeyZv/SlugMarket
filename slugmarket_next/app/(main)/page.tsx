import ListingCard from "../components/ListingCard"
import { fetchProducts } from "@/lib/fetchProducts";

export default async function HomePage() {
  const products = await fetchProducts("product_listings");
  return (
    <>
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to SlugMarket</h1>
        <p className="text-gray-500 text-lg mb-8">
          Buy and sell with fellow UCSC students.
        </p>
        {/* grid-cols-1 (Mobile), sm (Small Devices), lg (Computers/Laptops) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 auto-rows-fr">
         {(products ?? []).map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} priority={index === 0} />
      ))} </div>
      </main>
    </>
  )
}