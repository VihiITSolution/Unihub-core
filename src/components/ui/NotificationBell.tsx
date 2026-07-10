"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  notificationService,
  type Notification,
} from "@/services/notification.service";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, X, Check, Trash2 } from "lucide-react";

export const NotificationBell: React.FC = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await notificationService.getUnreadCount(token);
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(token, {
        page: 1,
        limit: 10,
      });
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    if (!token) return;
    try {
      const response = await notificationService.markAsRead(
        notificationId,
        token,
      );
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      const response = await notificationService.markAllAsRead(token);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: new Date().toISOString(),
          })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId: number) => {
    if (!token) return;
    try {
      const response = await notificationService.deleteNotification(
        notificationId,
        token,
      );
      if (response.success) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId),
        );
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Get notification type styling
  const getNotificationStyle = (type: Notification["type"]) => {
    switch (type) {
      case "tutor_approved":
      case "course_approved":
        return "border-l-4 border-green-500 bg-green-50";
      case "tutor_rejected":
      case "course_rejected":
        return "border-l-4 border-red-500 bg-red-50";
      case "enrollment":
        return "border-l-4 border-blue-500 bg-blue-50";
      case "payment":
        return "border-l-4 border-purple-500 bg-purple-50";
      case "follow":
        return "border-l-4 border-sky-500 bg-sky-50";
      case "post_like":
        return "border-l-4 border-pink-500 bg-pink-50";
      case "post_comment":
        return "border-l-4 border-teal-500 bg-teal-50";
      default:
        return "border-l-4 border-gray-300 bg-white";
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!token) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-40"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 px-1 text-xs font-bold leading-none text-white bg-amber-500 rounded-full transform translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col max-w-[calc(100vw-2rem)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  title="Mark all as read"
                >
                  <Check size={18} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    } ${getNotificationStyle(notification.type)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 p-3 text-center">
              <button
                onClick={() => {
                  window.location.href = "/student/notifications";
                  setIsOpen(false);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
