"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/types";

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockProducts: Product[] = [
        {
          id: "1",
          title: "Programming Laptop Stand",
          description: "Ergonomic laptop stand for developers",
          images: [],
          price: 49.99,
          sellerId: "seller1",
          sellerName: "Tech Seller",
          category: "Electronics",
          stock: 50,
          rating: 4.5,
          reviewCount: 23,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Web Development Books Bundle",
          description: "Complete set of web development books",
          images: [],
          price: 79.99,
          sellerId: "seller2",
          sellerName: "Book Store",
          category: "Books",
          stock: 30,
          rating: 4.8,
          reviewCount: 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Mechanical Keyboard",
          description: "RGB mechanical keyboard for coding",
          images: [],
          price: 129.99,
          sellerId: "seller3",
          sellerName: "Gaming Gear",
          category: "Electronics",
          stock: 20,
          rating: 4.7,
          reviewCount: 67,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Electronics", "Books", "Accessories", "Software", "Other"];

  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold mb-8">Marketplace</h1>

      {/* Filters */}
      <div className="mb-8 grid md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="input-field"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="input-field"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          className="btn-primary"
          onClick={() => setFilters({ search: "", category: "" })}
        >
          Clear Filters
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div className="w-full h-48 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-lg mb-4 flex items-center justify-center text-white text-3xl font-bold">
                {product.title.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {product.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <span>⭐ {product.rating}</span>
                <span>({product.reviewCount})</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock ({product.stock})</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-2xl font-bold text-primary-600">
                  ${product.price}
                </span>
                <Link href={`/marketplace/${product.id}`} className="btn-primary text-sm px-3 py-1">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action for Sellers */}
      <div className="mt-16 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Want to Sell on UniHub?</h2>
        <p className="text-xl mb-6">
          Join our marketplace and reach thousands of students and professionals
        </p>
        <Link href="/seller/dashboard" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block">
          Become a Seller
        </Link>
      </div>
    </div>
  );
}
