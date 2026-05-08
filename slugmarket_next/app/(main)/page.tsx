import ListingCard from "../components/ListingCard"
import { fetchProducts } from "@/lib/fetchProducts";
import FilterForm from "@/app/components/FilterForm";

export default async function HomePage() {
  const products = await fetchProducts("product_listings");

  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to SlugMarket
      </h1>

      <p className="text-gray-500 text-lg mb-8">
        Buy and sell with fellow UCSC students.
      </p>

      <FilterForm initialProducts={products} />
    </main>
  );

}