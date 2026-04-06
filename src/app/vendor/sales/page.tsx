"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { marketplaceService } from "@/services/marketplace.service";
import type { Order } from "@/types";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export default function VendorSalesPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (!user?.isVendorProfileComplete) {
      router.push("/student/become-vendor");
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = filter === "all" ? {} : { status: filter };
      const response = await marketplaceService.getMySales(params, token);
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      // Silently handle errors for empty results
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    if (!token) return;

    try {
      await marketplaceService.updateOrderStatus(
        orderId,
        { status: newStatus },
        token,
      );
      await loadOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextStatus = (currentStatus: string): OrderStatus | null => {
    switch (currentStatus) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "shipped";
      case "shipped":
        return "delivered";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-pulse">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Sales & Orders</h1>
        <p className="text-gray-600">Manage your customer orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b overflow-x-auto">
        {[
          "all",
          "pending",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap ${
              filter === status
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-gray-600">Your customer orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    Rs.{" "}
                    {order.totalPrice?.toFixed(2) ||
                      order.item?.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Qty: {order.quantity}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">{order.item?.title}</div>
                <div className="text-sm text-gray-600">
                  {order.item?.category} • Rs. {order.item?.price} each
                </div>
              </div>

              {/* Buyer Info */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Buyer
                </div>
                <div className="text-sm">
                  {order.buyer
                    ? `${order.buyer.firstName} ${order.buyer.lastName}`
                    : "N/A"}{" "}
                  ({order.buyer?.email || "N/A"})
                </div>
              </div>

              {/* Status Actions */}
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <div className="flex gap-2 pt-4 border-t">
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          order.id,
                          getNextStatus(order.status)!,
                        )
                      }
                      className="btn-primary text-sm"
                    >
                      Mark as {getNextStatus(order.status)}
                    </button>
                  )}
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, "cancelled")}
                      className="btn-outline text-sm border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
