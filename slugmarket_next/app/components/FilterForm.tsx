"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import ListingCard from "./ListingCard";
import { Listing } from "@/lib/types";

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Electronics", value: "electronics" },
  { label: "Furniture", value: "furniture" },
  { label: "Clothing", value: "clothing" },
  { label: "Books", value: "books" },
  { label: "Other", value: "other" },
];

const CONDITIONS = [
  { label: "Any Condition", value: "" },
  { label: "New", value: "New" },
  { label: "Like New", value: "Like New" },
  { label: "Good", value: "Good" },
  { label: "Fair", value: "Fair" },
  { label: "Poor", value: "Poor" },
];

const triggerClass =
  "w-full flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition hover:border-gray-300 focus:outline-none focus:border-[#0F2044] cursor-pointer";

export default function FilterForm({ initialProducts }: { initialProducts: Listing[] }) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Listing[]>(initialProducts);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const conditionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
      if (conditionRef.current && !conditionRef.current.contains(e.target as Node)) setConditionOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleClear = async () => {
    setFilters({});

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    setProducts(data.products);
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");
  const categoryLabel = CATEGORIES.find((c) => c.value === (filters.category ?? ""))?.label ?? "All Categories";
  const conditionLabel = CONDITIONS.find((c) => c.value === (filters.condition ?? ""))?.label ?? "Any Condition";

  return (
    <>
      <form
        onSubmit={handleFilter}
        className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-8"
      >
        <div className="flex flex-col min-[770px]:flex-row gap-4 items-end">
          {/* Category */}
          <div className="flex flex-col gap-1.5 w-full min-[770px]:w-48" ref={categoryRef}>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setCategoryOpen((v) => !v); setConditionOpen(false); }}
                className={triggerClass}
              >
                <span className={filters.category ? "text-gray-900" : "text-gray-400"}>{categoryLabel}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
              </button>
              {categoryOpen && (
                <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.value}>
                      <button
                        type="button"
                        onClick={() => { setFilters((prev) => ({ ...prev, category: cat.value })); setCategoryOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#0F2044]/5 transition cursor-pointer"
                      >
                        <span className="flex-1 text-left">{cat.label}</span>
                        {(filters.category ?? "") === cat.value && <Check size={14} className="text-[#0F2044] shrink-0" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1.5 w-full min-[770px]:w-48" ref={conditionRef}>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Condition</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setConditionOpen((v) => !v); setCategoryOpen(false); }}
                className={triggerClass}
              >
                <span className={filters.condition ? "text-gray-900" : "text-gray-400"}>{conditionLabel}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${conditionOpen ? "rotate-180" : ""}`} />
              </button>
              {conditionOpen && (
                <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {CONDITIONS.map((cond) => (
                    <li key={cond.value}>
                      <button
                        type="button"
                        onClick={() => { setFilters((prev) => ({ ...prev, condition: cond.value })); setConditionOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-800 hover:bg-[#0F2044]/5 transition cursor-pointer"
                      >
                        <span className="flex-1 text-left">{cond.label}</span>
                        {(filters.condition ?? "") === cond.value && <Check size={14} className="text-[#0F2044] shrink-0" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-1.5 w-full min-[770px]:w-auto min-[770px]:flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                min={0}
                value={filters.minPrice || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0F2044] focus:outline-none transition"
              />
              <span className="text-gray-400 font-medium shrink-0">—</span>
              <input
                type="number"
                placeholder="Max"
                min={0}
                value={filters.maxPrice || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0F2044] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            {hasFilters && (
              <button
                type="button"
                onClick={handleClear}
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
