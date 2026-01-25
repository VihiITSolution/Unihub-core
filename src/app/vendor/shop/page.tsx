"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { vendorService } from "@/services/vendor.service";
import type { VendorProfile } from "@/types";

export default function VendorShopSettingsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Partial<VendorProfile>>({
    shopName: "",
    shopDescription: "",
    businessType: "individual",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: ""
  });

  useEffect(() => {
    if (!user?.isVendorProfileComplete) {
      router.push("/student/become-vendor");
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await vendorService.getMyProfile(token);
      if (response.success && response.data) {
        setFormData(response.data.profile);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await vendorService.updateProfile(formData, token);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.error || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-pulse">Loading shop settings...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop Settings</h1>
        <p className="text-gray-600">Update your vendor profile and shop information</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Shop settings updated successfully!
          </div>
        )}

        {/* Shop Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Shop Information</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Shop Description</label>
            <textarea
              name="shopDescription"
              value={formData.shopDescription}
              onChange={handleChange}
              rows={4}
              className="input"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Business Type</label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="input"
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* Bank Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Bank Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            For receiving payments from sales
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Account Holder Name</label>
            <input
              type="text"
              name="bankAccountName"
              value={formData.bankAccountName}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Account Number</label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/vendor/dashboard")}
            className="btn-outline flex-1"
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
