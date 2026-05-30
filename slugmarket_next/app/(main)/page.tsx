import { fetchProducts } from "@/lib/fetchProducts";
import FilterForm from "@/app/components/FilterForm";
import Link from "next/link";

// HomePage component is the main landing page of the application. 
// It fetches a list of products from the database and displays them using the FilterForm component, which allows users to filter and browse through the listings. 
// The page also includes a hero section with a call-to-action for users to start selling or browse listings.
export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <main>
      {/* Hero */}
      <section className="bg-[#0F2044] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Your UCSC <span className="text-[#F5C518]">Marketplace</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl">
            Buy and sell with fellow Slugs. Local pickup, no fees, just students helping students.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/products/create"
              className="bg-[#F5C518] text-[#0F2044] font-bold px-8 py-3 rounded-full text-lg hover:bg-yellow-300 transition"
            >
              Start Selling
            </Link>
            <a
              href="#listings"
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-full text-lg hover:bg-white hover:text-[#0F2044] transition"
            >
              Browse Listings
            </a>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" className="max-w-5xl mx-auto px-6 py-10">
        <FilterForm initialProducts={products} />
      </section>
    </main>
  );
}