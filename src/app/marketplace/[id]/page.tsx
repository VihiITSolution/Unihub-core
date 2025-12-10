"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockProduct: Product = {
        id: productId,
        title: "Programming Laptop Stand",
        description:
          "Premium ergonomic laptop stand designed specifically for developers and programmers. Adjustable height, sturdy aluminum construction, and cable management system. Perfect for long coding sessions.",
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
      };
      setProduct(mockProduct);
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity} item(s) to cart`);
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div>
          <div className="w-full h-96 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-lg mb-4 flex items-center justify-center text-white text-6xl font-bold">
            {product.title.charAt(0)}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-gray-200 rounded-lg cursor-pointer hover:opacity-80"
              ></div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-gray-600">({product.reviewCount} reviews)</span>
            </div>
          </div>

          <div className="text-4xl font-bold text-primary-600 mb-6">
            ${product.price}
          </div>

          <div className="mb-6">
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
              {product.category}
            </span>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Stock and Seller Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Seller:</span>
              <span className="font-semibold">{product.sellerName}</span>
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-gray-600 font-semibold">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button onClick={handleAddToCart} className="btn-primary w-full">
                Add to Cart
              </button>
              <Link
                href="/auth/login"
                className="block text-center py-3 px-6 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold"
              >
                Buy Now
              </Link>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <span>✓</span>
              <span>Fast shipping</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>✓</span>
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>✓</span>
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-12">
        <div className="border-b mb-6">
          <div className="flex gap-8">
            <button className="pb-4 border-b-2 border-primary-600 font-semibold text-primary-600">
              Description
            </button>
            <button className="pb-4 text-gray-600">Reviews</button>
            <button className="pb-4 text-gray-600">Shipping</button>
          </div>
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Related Products</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="w-full h-40 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-4"></div>
              <h3 className="font-semibold mb-2">Related Product {i}</h3>
              <div className="text-xl font-bold text-primary-600 mb-2">
                $29.99
              </div>
              <Link href={`/marketplace/${i}`} className="text-primary-600 hover:underline text-sm">
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
