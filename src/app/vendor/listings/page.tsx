"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { marketplaceService } from "@/services/marketplace.service";
import Link from "next/link";
import type { MarketplaceItem } from "@/types";

export default function VendorListingsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    if (!user?.isVendorProfileComplete) {
      router.push("/student/become-vendor");
      return;
    }
    loadListings();
  }, [user]);

  const loadListings = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await marketplaceService.getMyListings(token);
      if (response.success && response.data) {
        setListings(response.data.items);
      }
    } catch (error) {
      console.error("Failed to load listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Are you sure you want to delete this listing?"))
      return;

    try {
      await marketplaceService.deleteListing(id, token);
      await loadListings();
    } catch (error) {
      console.error("Failed to delete listing:", error);
      alert("Failed to delete listing");
    }
  };

  const filteredListings = listings.filter((item) => {
    if (filter === "active") return item.isAvailable;
    if (filter === "inactive") return !item.isAvailable;
    return true;
  });

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-pulse">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Listings</h1>
          <p className="text-gray-600">Manage your marketplace products</p>
        </div>
        <Link href="/vendor/listings/create" className="btn-primary">
          + Create New Listing
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === "all"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          All ({listings.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === "active"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Active ({listings.filter((l) => l.isAvailable).length})
        </button>
        <button
          onClick={() => setFilter("inactive")}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === "inactive"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Inactive ({listings.filter((l) => !l.isAvailable).length})
        </button>
      </div>

      {/* Listings Table */}
      {filteredListings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first listing to start selling
          </p>
          <Link href="/vendor/listings/create" className="btn-primary">
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Views
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredListings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.category}</td>
                  <td className="px-4 py-3 font-semibold">Rs. {item.price}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        item.stock > 10
                          ? "text-green-600"
                          : item.stock > 0
                            ? "text-orange-600"
                            : "text-red-600"
                      }
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.soldCount}</td>
                  <td className="px-4 py-3 text-sm">{item.viewCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/vendor/listings/${item.id}`}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
