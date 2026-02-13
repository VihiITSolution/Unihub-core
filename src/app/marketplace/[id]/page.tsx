"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { marketplaceService } from "@/services/marketplace.service";
import type { MarketplaceItem } from "@/types";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const productId = parseInt(params.id as string);

  const [product, setProduct] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.getItemById(productId);

      if (response.success && response.data) {
        setProduct(response.data.item);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user || !token) {
      router.push("/auth/login");
      return;
    }

    if (!product || product.stock < quantity) {
      setError("Insufficient stock available");
      return;
    }

    setPurchasing(true);
    setError("");

    try {
      const response = await marketplaceService.createOrder(
        {
          itemId: product.id,
          quantity: quantity,
          shippingAddress: "User's default address", // TODO: Add address selection
        },
        token,
      );

      if (response.success) {
        alert("Order placed successfully! Check your orders page for details.");
        router.push("/student/orders"); // TODO: Create orders page
      } else {
        setError(response.error || "Failed to place order");
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setPurchasing(false);
    }
  };

  const isOwnListing = user && product && product.sellerId === Number(user.id);

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-pulse text-lg">
            Loading product details...
          </div>
        </div>
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="container-custom py-12">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold mb-2">Product not found</h3>
          <p className="text-gray-600 mb-6">
            {error || "The product you are looking for does not exist"}
          </p>
          <Link href="/marketplace" className="btn-primary inline-block">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/marketplace" className="hover:text-primary-600">
          Marketplace
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div>
          <div className="w-full aspect-square bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl mb-4 flex items-center justify-center text-white text-8xl font-bold shadow-lg">
            {product.title.charAt(0)}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition"
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: "cover",
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
              {product.category}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
              {product.condition
                ?.split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

          <div className="text-5xl font-bold text-primary-600 mb-6">
            ${Number(product.price).toFixed(2)}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed text-lg">
            {product.description}
          </p>

          {/* Stock and Seller Info */}
          <div className="mb-6 p-6 bg-gray-50 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Availability:</span>
              {product.stock > 0 ? (
                <span
                  className={`font-semibold ${product.stock > 10 ? "text-green-600" : "text-orange-600"}`}
                >
                  {product.stock > 10
                    ? `In Stock (${product.stock} available)`
                    : `Only ${product.stock} left!`}
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Seller:</span>
              <span className="font-semibold">
                {product.seller
                  ? `${product.seller.firstName} ${product.seller.lastName}`
                  : "Unknown Seller"}
              </span>
            </div>
            {product.soldCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Sold:</span>
                <span className="font-semibold text-primary-600">
                  {product.soldCount} units
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Views:</span>
              <span className="font-semibold">{product.viewCount || 0}</span>
            </div>
          </div>

          {/* Quantity and Purchase Actions */}
          {product.stock > 0 && !isOwnListing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-semibold">Quantity:</label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x-2 border-gray-300 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-4 py-2 hover:bg-gray-100 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600 text-sm">
                  Total: ${(Number(product.price) * quantity).toFixed(2)}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleBuyNow}
                disabled={purchasing}
                className="btn-primary w-full py-4 text-lg font-semibold"
              >
                {purchasing ? "Processing..." : "Buy Now"}
              </button>

              {!user && (
                <p className="text-center text-sm text-gray-600">
                  <Link
                    href="/auth/login"
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Sign in
                  </Link>{" "}
                  to purchase this item
                </p>
              )}
            </div>
          ) : isOwnListing ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              <p className="font-medium">This is your own listing</p>
              <p className="text-sm mt-1">
                You cannot purchase your own products
              </p>
              <Link
                href="/vendor/listings"
                className="btn-outline mt-3 inline-block"
              >
                Manage Your Listings
              </Link>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Out of Stock</p>
              <p className="text-sm mt-1">This item is currently unavailable</p>
            </div>
          )}
          {/* Features */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">
              Buyer Protection
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <span>✓</span>
                <span>Secure payment through UniHub</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <span>✓</span>
                <span>Direct communication with seller</span>
              </div>
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <span>✓</span>
                <span>Order tracking and updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Product Information */}
      <div className="card mb-12">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <div className="prose max-w-none">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Item Information
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="font-medium">{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Condition:</dt>
                  <dd className="font-medium">
                    {product.condition
                      ?.split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Listed:</dt>
                  <dd className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            {product.seller?.vendorProfile && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Seller Information
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Shop:</dt>
                    <dd className="font-medium">
                      {product.seller.vendorProfile.shopName}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Total Sales:</dt>
                    <dd className="font-medium">
                      {product.seller.vendorProfile.totalSales || 0} items
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Business Type:</dt>
                    <dd className="font-medium capitalize">
                      {product.seller.vendorProfile.businessType}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
