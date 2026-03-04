"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { marketplaceService } from "@/services/marketplace.service";
import type { MarketplaceItem } from "@/types";

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    condition: "",
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.getItems({
        search: filters.search || undefined,
        category: filters.category || undefined,
        condition: filters.condition || undefined,
      });
      
      if (response.success && response.data) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["books", "electronics", "stationery", "accessories", "furniture", "clothing", "sports", "other"];
  const conditions = ["new", "like-new", "good", "fair", "poor"];

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-600">Buy and sell items within the UniHub community</p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="input"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="input"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={filters.condition}
          onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
        >
          <option value="">All Conditions</option>
          {conditions.map((cond) => (
            <option key={cond} value={cond}>
              {cond.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </option>
          ))}
        </select>
        <button
          className="btn-outline"
          onClick={() => setFilters({ search: "", category: "", condition: "" })}
        >
          Clear Filters
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse">Loading products...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/marketplace/${product.id}`}>
              <div className="card hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-lg mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  {product.title.charAt(0)}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {product.category}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {product.condition?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 text-sm line-clamp-2 flex-1">
                    {product.description}
                  </p>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Seller: <span className="font-medium">{product.seller?.vendorProfile?.shopName || product.seller?.name || 'Unknown'}</span>
                  </div>
                  
                  <div className="text-sm mb-4">
                    {product.stock > 0 ? (
                      <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                        {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t mt-auto">
                    <span className="text-2xl font-bold text-primary-600">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="btn-primary text-sm px-4 py-2">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Call to Action for Sellers */}
      <div className="mt-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Want to Sell on UniHub?</h2>
        <p className="text-xl mb-6">
          Join our marketplace and reach thousands of students across universities
        </p>
        <Link href="/student/become-vendor" className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block transition">
          Become a Vendor
        </Link>
      </div>
    </div>
  );
}
