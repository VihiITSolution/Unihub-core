"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { marketplaceService } from "@/services/marketplace.service";
import type { MarketplaceItem } from "@/types";

export default function CreateListingPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "books",
    itemType: "book" as
      | "book"
      | "notes"
      | "equipment"
      | "electronics"
      | "other",
    price: "",
    stock: "1",
    condition: "new" as "new" | "like_new" | "good" | "fair" | "poor",
    images: [] as string[],
  });

  useEffect(() => {
    if (!user?.isVendorProfileComplete) {
      router.push("/student/become-vendor");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const response = await marketplaceService.createListing(
        {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          itemType: formData.itemType,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          condition: formData.condition,
          images: formData.images,
        },
        token,
      );

      if (response.success) {
        router.push("/vendor/listings");
      } else {
        setError(response.error || "Failed to create listing");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Listing</h1>
        <p className="text-gray-600">Add a new product to your shop</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Product Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Product Information</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
              placeholder="e.g., Used Calculus Textbook"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="input"
              placeholder="Describe your product in detail..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="books">Books & Textbooks</option>
                <option value="electronics">Electronics</option>
                <option value="stationery">Stationery</option>
                <option value="accessories">Accessories</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="sports">Sports Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Item Type <span className="text-red-500">*</span>
              </label>
              <select
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="book">Book</option>
                <option value="notes">Notes</option>
                <option value="equipment">Equipment</option>
                <option value="electronics">Electronics</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="input"
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* Images Section (Placeholder) */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-2">📷</div>
              <p>Image upload coming soon</p>
              <p className="text-sm mt-1">
                For now, listings will use default images
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline flex-1"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
