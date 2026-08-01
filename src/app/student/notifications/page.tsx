"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { notificationService, type Notification } from "@/services/notification.service";
import { Bell, Check, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const TYPE_STYLES: Record<string, string> = {
  tutor_approved:  "border-l-4 border-green-500 bg-green-50",
  course_approved: "border-l-4 border-green-500 bg-green-50",
  tutor_rejected:  "border-l-4 border-red-500 bg-red-50",
  course_rejected: "border-l-4 border-red-500 bg-red-50",
  enrollment:      "border-l-4 border-blue-500 bg-blue-50",
  payment:         "border-l-4 border-purple-500 bg-purple-50",
  follow:          "border-l-4 border-sky-500 bg-sky-50",
  post_like:       "border-l-4 border-pink-500 bg-pink-50",
  post_comment:    "border-l-4 border-teal-500 bg-teal-50",
  general:         "border-l-4 border-gray-300 bg-white",
};

const TYPE_LABELS: Record<string, string> = {
  tutor_approved:  "Tutor",
  course_approved: "Course",
  tutor_rejected:  "Tutor",
  course_rejected: "Course",
  enrollment:      "Enrollment",
  payment:         "Payment",
  follow:          "Follow",
  post_like:       "Like",
  post_comment:    "Comment",
  general:         "General",
};

function formatTimeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

const LIMIT = 20;

export default function NotificationsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(token, { page, limit: LIMIT, unreadOnly });
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
      const countRes = await notificationService.getUnreadCount(token);
      if (countRes.success && countRes.data) setUnreadCount(countRes.data.count);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, page, unreadOnly]);

  useEffect(() => { load(); }, [load]);

  const markAsRead = async (id: number) => {
    if (!token) return;
    await notificationService.markAsRead(id, token);
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
    if (!token) return;
    await notificationService.markAllAsRead(token);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id: number, wasUnread: boolean) => {
    if (!token) return;
    await notificationService.deleteNotification(id, token);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    setTotal((t) => Math.max(0, t - 1));
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) router.push(n.link);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please <a href="/auth/login" className="text-green-700 underline">sign in</a> to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell size={22} /> Notifications
              {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} notification{total !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Unread filter toggle */}
            <button
              onClick={() => { setUnreadOnly((v) => !v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                unreadOnly
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Unread only
            </button>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Check size={15} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">{unreadOnly ? "No unread notifications" : "No notifications yet"}</p>
              {unreadOnly && (
                <button onClick={() => setUnreadOnly(false)} className="mt-2 text-sm text-green-700 hover:underline">
                  Show all
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 ${
                    !n.isRead ? "bg-blue-50/40" : ""
                  } ${TYPE_STYLES[n.type] ?? TYPE_STYLES.general}`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    {!n.isRead
                      ? <span className="block w-2.5 h-2.5 rounded-full bg-blue-500" />
                      : <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
                    }
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleClick(n)}
                  >
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {TYPE_LABELS[n.type] ?? "General"}
                      </span>
                      <span className="text-xs text-gray-400">{formatTimeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                        title="Mark as read"
                        className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <Check size={15} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif(n.id, !n.isRead); }}
                      title="Delete"
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
