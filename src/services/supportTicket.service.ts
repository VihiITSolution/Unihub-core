import { API_BASE_URL } from "@/lib/constants";
import type { ApiResponse } from "@/types";

export interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  attachments: string[];
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
}

export interface CreateTicketData {
  subject: string;
  category: string;
  priority: string;
  description: string;
  attachments: File[];
}

export const supportTicketService = {
  async createTicket(
    token: string,
    data: CreateTicketData,
  ): Promise<ApiResponse<{ ticket: SupportTicket }>> {
    const formData = new FormData();
    formData.append("subject", data.subject);
    formData.append("category", data.category);
    formData.append("priority", data.priority);
    formData.append("description", data.description);
    data.attachments.forEach((file) => formData.append("attachments", file));

    const response = await fetch(`${API_BASE_URL}/support/tickets`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    return response.json();
  },

  async getMyTickets(
    token: string,
  ): Promise<ApiResponse<{ tickets: SupportTicket[] }>> {
    const response = await fetch(`${API_BASE_URL}/support/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.json();
  },
};
