import { fetchProducts } from "@/lib/fetchProducts";
import FilterForm from "@/app/components/FilterForm";

// The HomePage component fetches all products from the database and renders the main landing page of the application. It includes a welcome message and a FilterForm component that allows users to filter products based on various criteria. The initial list of products is passed to the FilterForm as a prop, enabling it to display the products before any filters are applied.
export default async function HomePage() {
  const products = await fetchProducts();

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