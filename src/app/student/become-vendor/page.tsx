"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { vendorService } from "@/services/vendor.service";
import { isValidPhone, isValidShopName } from "@/lib/validation";

export default function BecomeVendorPage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    shopName: "",
    shopDescription: "",
    businessType: "individual" as "individual" | "business",
    contactEmail: user?.email || "",
    contactPhone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    taxId: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please login to continue");
      return;
    }

    if (!isValidShopName(formData.shopName)) {
      setError(
        "Shop name must be 3-60 characters and start/end with a letter or number",
      );
      return;
    }
    if (formData.contactPhone.trim() && !isValidPhone(formData.contactPhone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await vendorService.createProfile(formData, token);
      
      if (response.success) {
        // Refresh user data to update vendor status
        await refreshUser?.();
        
        // Redirect to vendor dashboard
        router.push("/vendor/dashboard");
      } else {
        setError(response.message || "Failed to create vendor profile");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (user?.isVendorProfileComplete) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">You're Already a Vendor!</h1>
        <p className="text-gray-600 mb-6">You have already created your vendor profile.</p>
        <button
          onClick={() => router.push("/vendor/dashboard")}
          className="btn-primary"
        >
          Go to Vendor Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Become a Vendor</h1>
        <p className="text-gray-600">
          Start selling your products on UniHub marketplace. Fill in the details below to create your vendor profile.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* Shop Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Shop Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Tech Store, Book Haven"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Shop Description
              </label>
              <textarea
                name="shopDescription"
                value={formData.shopDescription}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Describe what you sell and what makes your shop unique..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Business Type
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="individual">Individual Seller</option>
                <option value="business">Registered Business</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Address</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input-field"
                placeholder="United States"
              />
            </div>
          </div>

          {/* Business Information (Optional) */}
          {formData.businessType === "business" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Tax ID / Business Registration Number
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || !formData.shopName}
            >
              {loading ? "Creating Profile..." : "Create Vendor Profile"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2 text-blue-900">What happens next?</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>✓ Your vendor profile will be created and auto-approved</li>
          <li>✓ You'll get access to the vendor dashboard</li>
          <li>✓ You can start creating product listings immediately</li>
          <li>✓ Customers can browse and purchase your products</li>
        </ul>
      </div>
    </div>
  );
}
