"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { vendorService } from "@/services/vendor.service";
import { marketplaceService } from "@/services/marketplace.service";
import Link from "next/link";

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  averageRating: number;
}

export default function VendorDashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (!user?.isVendorProfileComplete) {
      router.push("/student/become-vendor");
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Load vendor stats - handle if profile doesn't exist yet
      let vendorStats = null;
      try {
        vendorStats = await vendorService.getStats(token);
      } catch (error) {
        console.log("Vendor stats not available (profile may not exist yet)");
      }

      // Load listings
      let listings: any = { success: true, data: { items: [] } };
      try {
        listings = await marketplaceService.getMyListings(token);
      } catch (error) {
        console.log("No listings found");
      }

      // Load sales - handle if there are none
      let sales: any = { success: true, data: [] };
      try {
        sales = await marketplaceService.getMySales(
          { status: "pending" },
          token,
        );
      } catch (error) {
        console.log("No sales found (expected for new vendors)");
      }

      setStats({
        totalListings: listings.data?.items?.length || 0,
        activeListings:
          listings.data?.items?.filter((item: any) => item.isAvailable)
            .length || 0,
        totalSales: vendorStats?.data?.stats?.totalSales || 0,
        totalRevenue: vendorStats?.data?.stats?.totalRevenue || 0,
        pendingOrders: sales.data?.length || 0,
        averageRating: vendorStats?.data?.stats?.averageRating || 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's your shop overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          <div className="text-sm text-blue-600 font-medium mb-1">
            Total Listings
          </div>
          <div className="text-3xl font-bold text-blue-900">
            {stats.totalListings}
          </div>
          <div className="text-sm text-blue-600 mt-1">
            {stats.activeListings} active
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 p-6">
          <div className="text-sm text-green-600 font-medium mb-1">
            Total Sales
          </div>
          <div className="text-3xl font-bold text-green-900">
            {stats.totalSales}
          </div>
          <div className="text-sm text-green-600 mt-1">items sold</div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 p-6">
          <div className="text-sm text-purple-600 font-medium mb-1">
            Total Revenue
          </div>
          <div className="text-3xl font-bold text-purple-900">
            $
            {typeof stats.totalRevenue === "number"
              ? stats.totalRevenue.toFixed(2)
              : parseFloat(stats.totalRevenue || 0).toFixed(2)}
          </div>
          <div className="text-sm text-purple-600 mt-1">all time</div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 p-6">
          <div className="text-sm text-orange-600 font-medium mb-1">
            Pending Orders
          </div>
          <div className="text-3xl font-bold text-orange-900">
            {stats.pendingOrders}
          </div>
          <div className="text-sm text-orange-600 mt-1">need attention</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8 p-6">
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/vendor/listings/create"
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <div className="font-semibold">Create New Listing</div>
            <div className="text-sm text-gray-600 mt-1">
              Add a product to your shop
            </div>
          </Link>

          <Link
            href="/vendor/orders"
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <div className="font-semibold">Manage Orders</div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.pendingOrders} pending
            </div>
          </Link>

          <Link
            href="/vendor/shop"
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            <div className="font-semibold">Shop Settings</div>
            <div className="text-sm text-gray-600 mt-1">
              Update your shop info
            </div>
          </Link>
        </div>
      </div>

      {/* Performance */}
      {stats.averageRating > 0 && (
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Performance</h2>
          <div className="flex items-center gap-8">
            <div>
              <div className="text-sm text-gray-600 mb-1">Average Rating</div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
              <div className="text-3xl font-bold">
                {stats.totalListings > 0
                  ? ((stats.totalSales / stats.totalListings) * 100).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
