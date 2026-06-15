"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { marketplaceService } from "@/services/marketplace.service";
import type { MarketplaceItem } from "@/types";
import type { MarketplaceFilters } from "@/services/marketplace.service";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "books", label: "Books & Textbooks" },
  { value: "electronics", label: "Electronics" },
  { value: "stationery", label: "Stationery" },
  { value: "accessories", label: "Accessories" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing" },
  { value: "sports", label: "Sports Equipment" },
  { value: "other", label: "Other" },
];

const CONDITIONS = [
  { value: "", label: "Any Condition" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

function conditionLabel(c: string) {
  return CONDITIONS.find((x) => x.value === c)?.label ?? c;
}

function ItemCard({ item }: { item: MarketplaceItem }) {
  return (
    <Link
      href={`/marketplace/${item.id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-primary-400 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Image / placeholder */}
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-5xl font-bold">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          item.title.charAt(0)
        )}
      </div>

      <div className="p-4">
        {/* Category + condition */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {item.category}
          </span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
            {conditionLabel(item.condition)}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-1">
          {item.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            ${Number(item.price).toFixed(2)}
          </span>
          <span
            className={`text-xs font-medium ${
              item.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {item.seller && (
          <p className="mt-2 text-xs text-gray-400 truncate">
            by{" "}
            {item.seller.vendorProfile?.shopName ||
              `${item.seller.firstName} ${item.seller.lastName}`}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const LIMIT = 12;

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const filters: MarketplaceFilters = { page, limit: LIMIT };
      if (search) filters.search = search;
      if (category) filters.category = category;
      if (condition) filters.condition = condition;
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);

      const response = await marketplaceService.getItems(filters);
      if (response.success && response.data) {
        setItems(response.data as unknown as MarketplaceItem[]);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotal(response.pagination.total);
        }
      }
    } catch (err) {
      console.error("Failed to load marketplace items:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, minPrice, maxPrice, page]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const hasActiveFilters = search || category || condition || minPrice || maxPrice;

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-600">
          Buy and sell items with other students — textbooks, electronics, stationery and more.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for textbooks, electronics, and more..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="btn-outline px-4 text-sm"
          >
            Clear
          </button>
        )}
      </form>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
            <h2 className="font-semibold text-gray-900">Filters</h2>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  handleFilterChange();
                }}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value);
                  handleFilterChange();
                }}
                className="input"
              >
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (USD)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    handleFilterChange();
                  }}
                  className="input w-full"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    handleFilterChange();
                  }}
                  className="input w-full"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full text-sm text-primary-600 hover:underline text-left"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Sell CTA */}
          <div className="mt-4 bg-primary-50 border border-primary-200 rounded-xl p-5">
            <p className="font-semibold text-primary-900 mb-1">Have something to sell?</p>
            <p className="text-sm text-primary-700 mb-3">
              Post your ad free for 3 months during our limited-time promotion.
            </p>
            <Link href="/vendor/listings/create" className="btn-primary block text-center text-sm">
              Post an Ad
            </Link>
          </div>
        </aside>

        {/* Items grid */}
        <div className="flex-1 min-w-0">
          {/* Result count */}
          {!loading && (
            <p className="text-sm text-gray-500 mb-4">
              {total === 0
                ? "No items found"
                : `${total} item${total !== 1 ? "s" : ""} found`}
              {hasActiveFilters && " — filtered"}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-gray-500 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query."
                  : "Be the first to list something!"}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-outline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1
                    )
                    .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                            page === n
                              ? "bg-primary-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {n}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
