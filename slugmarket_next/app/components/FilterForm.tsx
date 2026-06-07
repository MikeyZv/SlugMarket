"use client";

import { useState } from "react";
import ListingCard from "./ListingCard";
import { Listing } from "@/lib/types";
import Dropdown, { Option } from "./Dropdown";

const CATEGORIES: Option[] = [
  { label: "All Categories", value: "" },
  { label: "Electronics", value: "Electronics" },
  { label: "Furniture", value: "Furniture" },
  { label: "Clothing", value: "Clothing" },
  { label: "Books", value: "Books" },
  { label: "Other", value: "Other" },
];

const CONDITIONS: Option[] = [
  { label: "Any Condition", value: "" },
  { label: "New", value: "New" },
  { label: "Like New", value: "Like New" },
  { label: "Good", value: "Good" },
  { label: "Fair", value: "Fair" },
  { label: "Poor", value: "Poor" },
];

const priceInputClass =
  "w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0F2044] focus:outline-none transition";

async function queryProducts(filters: Record<string, string>): Promise<Listing[]> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  return (await res.json()).products;
}

// Wraps the shared Dropdown with the filter bar's label + responsive width.
function FilterDropdown({ label, ...props }: { label: string } & React.ComponentProps<typeof Dropdown>) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-[770px]:w-48">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      <Dropdown {...props} />
    </div>
  );
}

export default function FilterForm({ initialProducts }: { initialProducts: Listing[] }) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Listing[]>(initialProducts);

  const set = (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));

  const apply = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProducts(await queryProducts(filters));
  };

  const clear = async () => {
    setFilters({});
    setProducts(await queryProducts({}));
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <>
      <form
        onSubmit={apply}
        className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8"
      >
        <div className="flex flex-col min-[770px]:flex-row gap-4 items-end">
          <FilterDropdown label="Category" options={CATEGORIES} value={filters.category ?? ""} onSelect={(v) => set("category", v)} />
          <FilterDropdown label="Condition" options={CONDITIONS} value={filters.condition ?? ""} onSelect={(v) => set("condition", v)} />

          {/* Price Range */}
          <div className="flex flex-col gap-1.5 w-full min-[770px]:w-auto min-[770px]:flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price Range</label>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" min={0} value={filters.minPrice || ""} onChange={(e) => set("minPrice", e.target.value)} className={priceInputClass} />
              <span className="text-gray-400 font-medium shrink-0">—</span>
              <input type="number" placeholder="Max" min={0} value={filters.maxPrice || ""} onChange={(e) => set("maxPrice", e.target.value)} className={priceInputClass} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            {hasFilters && (
              <button
                type="button"
                onClick={clear}
                className="rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="rounded-xl bg-[#F5C518] px-6 py-2.5 text-sm font-semibold text-[#0F2044] shadow-sm transition hover:bg-[#fde047] cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </form>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 min-[770px]:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {products.map((listing, index) => (
          <ListingCard key={listing.id} listing={listing} priority={index === 0} />
        ))}
      </div>
    </>
  );
}
