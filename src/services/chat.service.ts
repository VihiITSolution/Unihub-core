import { apiClient } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/constants";
import type { ApiResponse } from "@/types";
import type {
  ChatMessage,
  Conversation,
  ConversationContextType,
} from "@/types/chat";

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface MessageListResponse {
  messages: ChatMessage[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const chatService = {
  async getConversations(
    token: string,
    options?: { page?: number; limit?: number },
  ): Promise<ApiResponse<ConversationListResponse>> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    const qs = params.toString();
    return apiClient.get<ApiResponse<ConversationListResponse>>(
      `/chat/conversations${qs ? `?${qs}` : ""}`,
      { token },
    );
  },

  async getConversation(
    conversationId: number,
    token: string,
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    return apiClient.get<ApiResponse<{ conversation: Conversation }>>(
      `/chat/conversations/${conversationId}`,
      { token },
    );
  },

  async createConversation(
    recipientId: number,
    token: string,
    options?: { contextType?: ConversationContextType; contextId?: number },
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    return apiClient.post<ApiResponse<{ conversation: Conversation }>>(
      `/chat/conversations`,
      { recipientId, ...options },
      { token },
    );
  },

  async createSupportConversation(
    token: string,
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    return apiClient.post<ApiResponse<{ conversation: Conversation }>>(
      `/chat/support`,
      {},
      { token },
    );
  },

  async getMessages(
    conversationId: number,
    token: string,
    options?: { page?: number; limit?: number },
  ): Promise<ApiResponse<MessageListResponse>> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    const qs = params.toString();
    return apiClient.get<ApiResponse<MessageListResponse>>(
      `/chat/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
      { token },
    );
  },

  async markRead(conversationId: number, token: string): Promise<ApiResponse<null>> {
    return apiClient.put<ApiResponse<null>>(
      `/chat/conversations/${conversationId}/read`,
      {},
      { token },
    );
  },

  async getUnreadCount(token: string): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<ApiResponse<{ count: number }>>(`/chat/unread-count`, {
      token,
    });
  },

  /**
   * Sends a message with optional file attachments. Bypasses apiClient
   * (which always JSON-stringifies the body) for multipart/form-data,
   * mirroring the upload pattern in tutor/create-course/page.tsx.
   */
  async sendMessage(
    conversationId: number,
    token: string,
    options: { body?: string; files?: File[] },
  ): Promise<ApiResponse<{ message: ChatMessage }> & { code?: string; reasons?: string[] }> {
    const formData = new FormData();
    if (options.body) formData.append("body", options.body);
    (options.files || []).forEach((file) => formData.append("attachments", file));

    const response = await fetch(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );

    return response.json();
  },
};
