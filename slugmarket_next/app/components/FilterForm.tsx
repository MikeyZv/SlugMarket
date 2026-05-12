"use client";

import { useState } from "react";
import ListingCard from "./ListingCard";
import { Listing } from "@/lib/types";

export default function FilterForm({ initialProducts }: { initialProducts: Listing[] }) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Listing[]>(initialProducts);

  const handleFilter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });

    const data = await res.json();
    setProducts(data.products);
  };

  return (
    <>
      {/* Filter Form */}
      <form
        onSubmit={handleFilter}
        className="w-full bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center mb-8"
      >
        <select
          value={filters.category || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-48"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filters.condition || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, condition: e.target.value }))
          }
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-48"
        >
          <option value="">Any Conditions</option>
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Poor">Poor</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
          }
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-32"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
          }
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-32"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Filter
        </button>
      </form>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 auto-rows-fr">
        {products.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            priority={index === 0}
          />
        ))}
      </div>
    </>
  );
}
