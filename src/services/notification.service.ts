import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

export type NotificationType =
  | "tutor_approved"
  | "tutor_rejected"
  | "course_approved"
  | "course_rejected"
  | "enrollment"
  | "payment"
  | "general"
  | "follow"
  | "post_like"
  | "post_comment";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  metadata: Record<string, any> | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  /**
   * Get user's notifications with pagination
   */
  async getNotifications(
    token: string,
    options?: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
    },
  ): Promise<ApiResponse<NotificationListResponse>> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.unreadOnly) params.append("unreadOnly", "true");

    const queryString = params.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ""}`;

    return apiClient.get<ApiResponse<NotificationListResponse>>(url, {
      token,
    });
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(
    token: string,
  ): Promise<ApiResponse<UnreadCountResponse>> {
    return apiClient.get<ApiResponse<UnreadCountResponse>>(
      "/notifications/unread-count",
      { token },
    );
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(
    notificationId: number,
    token: string,
  ): Promise<ApiResponse<{ notification: Notification }>> {
    return apiClient.put<ApiResponse<{ notification: Notification }>>(
      `/notifications/${notificationId}/read`,
      {},
      { token },
    );
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(
    token: string,
  ): Promise<ApiResponse<{ updated: number }>> {
    return apiClient.put<ApiResponse<{ updated: number }>>(
      "/notifications/mark-all-read",
      {},
      { token },
    );
  },

  /**
   * Delete a notification
   */
  async deleteNotification(
    notificationId: number,
    token: string,
  ): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `/notifications/${notificationId}`,
      { token },
    );
  },
};
