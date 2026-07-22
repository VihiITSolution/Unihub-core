"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { marketplaceService } from "@/services/marketplace.service";
import { StartConversationButton } from "@/components/chat";
import type { MarketplaceItem } from "@/types";

// Buy Now imports — re-enable when purchase flow is ready
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/contexts/AuthContext";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);

  const [product, setProduct] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Buy Now state — re-enable when purchase flow is ready
  // const router = useRouter();
  // const { user, token } = useAuth();
  // const [purchasing, setPurchasing] = useState(false);
  // const [quantity, setQuantity] = useState(1);

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
    } catch (err) {
      console.error("Failed to load product:", err);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // Buy Now handler — re-enable when purchase flow is ready
  // const handleBuyNow = async () => {
  //   if (!user || !token) { router.push("/auth/login"); return; }
  //   if (!product || product.stock < quantity) { setError("Insufficient stock available"); return; }
  //   setPurchasing(true);
  //   setError("");
  //   try {
  //     const response = await marketplaceService.createOrder(
  //       { itemId: product.id, quantity, shippingAddress: "User's default address" },
  //       token,
  //     );
  //     if (response.success) {
  //       alert("Order placed successfully! Check your orders page for details.");
  //       router.push("/student/orders");
  //     } else {
  //       setError(response.error || "Failed to place order");
  //     }
  //   } catch (err: any) {
  //     setError(err.message || "Failed to place order");
  //   } finally {
  //     setPurchasing(false);
  //   }
  // };
  // const isOwnListing = user && product && String(product.sellerId) === String(user.id);

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading product details...</div>
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
        <Link href="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/marketplace" className="hover:text-primary-600">Marketplace</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {/* Product Images */}
        <div>
          <div className="w-full aspect-square bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl mb-4 flex items-center justify-center text-white text-8xl font-bold shadow-lg">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              product.title.charAt(0)
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {product.images.slice(1, 5).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 rounded-lg cursor-pointer hover:opacity-80 transition"
                  style={{ backgroundImage: `url(${img})`, backgroundSize: "cover" }}
                />
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
            Rs. {Number(product.price).toFixed(2)}
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed text-lg">
            {product.description}
          </p>

          {/* Stock and listing info */}
          <div className="mb-6 p-6 bg-gray-50 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Availability:</span>
              {product.stock > 0 ? (
                <span className={`font-semibold ${product.stock > 10 ? "text-green-600" : "text-orange-600"}`}>
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
                {product.seller?.vendorProfile?.shopName ||
                  product.seller?.name ||
                  "Unknown Seller"}
              </span>
            </div>
            {product.soldCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Sold:</span>
                <span className="font-semibold text-primary-600">{product.soldCount} units</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Views:</span>
              <span className="font-semibold">{product.viewCount || 0}</span>
            </div>
          </div>

          {/* ── Buy Now (disabled — coming soon) ──────────────────────────────
          {product.stock > 0 && !isOwnListing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-semibold">Quantity:</label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 font-bold text-lg">-</button>
                  <span className="px-6 py-2 border-x-2 border-gray-300 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 font-bold text-lg">+</button>
                </div>
                <span className="text-gray-600 text-sm">
                  Total: Rs. {(Number(product.price) * quantity).toFixed(2)}
                </span>
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}
              <button onClick={handleBuyNow} disabled={purchasing}
                className="btn-primary w-full py-4 text-lg font-semibold">
                {purchasing ? "Processing..." : "Buy Now"}
              </button>
              {!user && (
                <p className="text-center text-sm text-gray-600">
                  <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
                  {" "}to purchase this item
                </p>
              )}
            </div>
          ) : isOwnListing ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              <p className="font-medium">This is your own listing</p>
              <p className="text-sm mt-1">You cannot purchase your own products</p>
              <Link href="/vendor/listings" className="btn-outline mt-3 inline-block">Manage Your Listings</Link>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Out of Stock</p>
              <p className="text-sm mt-1">This item is currently unavailable</p>
            </div>
          )}
          ──────────────────────────────────────────────────────────────────── */}

          {/* Contact the Seller */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Contact the Seller</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Reach out directly to arrange purchase and payment.
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Seller avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg shrink-0">
                  {product.seller ? product.seller.firstName.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {product.seller?.vendorProfile?.shopName ||
                      (product.seller
                        ? `${product.seller.firstName} ${product.seller.lastName}`
                        : "Unknown Seller")}
                  </p>
                  {product.seller?.vendorProfile?.shopName && (
                    <p className="text-xs text-gray-500">
                      {product.seller.firstName} {product.seller.lastName}
                    </p>
                  )}
                </div>
              </div>

              {product.seller?.id && (
                <StartConversationButton
                  recipientId={Number(product.seller.id)}
                  contextType="marketplace_item"
                  contextId={Number(product.id)}
                  label="Message Seller"
                  className="w-full justify-center"
                />
              )}

              <hr className="border-gray-100" />

              {/* Email */}
              {product.seller?.email && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-6 text-center">✉</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <a
                      href={`mailto:${product.seller.email}`}
                      className="text-primary-600 hover:underline font-medium text-sm"
                    >
                      {product.seller.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {(product.seller as any)?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-6 text-center">📞</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <a
                      href={`tel:${(product.seller as any).phoneNumber}`}
                      className="text-primary-600 hover:underline font-medium text-sm"
                    >
                      {(product.seller as any).phoneNumber}
                    </a>
                  </div>
                </div>
              )}

              {/* Additional contact info from listing */}
              {product.contactInfo && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 w-6 text-center mt-0.5">💬</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Additional Contact</p>
                    <p className="text-sm text-gray-700">{product.contactInfo}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              {product.location && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-6 text-center">📍</span>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm text-gray-700">{product.location}</p>
                  </div>
                </div>
              )}

              {!product.seller?.email &&
                !(product.seller as any)?.phoneNumber &&
                !product.contactInfo && (
                  <p className="text-sm text-gray-500 italic">
                    No contact details provided by the seller.
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Product Information */}
      <div className="card mb-12">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Item Information</h3>
            <dl className="space-y-2">
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
              <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Shop:</dt>
                  <dd className="font-medium">{product.seller.vendorProfile.shopName}</dd>
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
  );
}
