import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  LiveSession,
  SessionEnrollment,
  CreateLiveSessionData,
  LiveSessionFilters,
} from "@/types";

export interface EnrollSessionData {
  paymentId?: string;
}

export interface InviteStudentsData {
  studentIds: number[];
}

export interface JoinSessionResponse {
  success: boolean;
  message: string;
  data: {
    provider: "youtube" | "teams";
    launchMode: "embed" | "external";
    joinUrl?: string;
    embedUrl?: string;
    chatUrl?: string;
    session: LiveSession;
  };
}

export interface CreateSessionResponse {
  success: boolean;
  message: string;
  data: {
    session: LiveSession;
    identity: MeetingIdentity;
  };
}

export interface MeetingIdentity {
  email: string;
  invitationStatus: "not_invited" | "pending" | "accepted" | "failed";
  invitationRedeemUrl?: string;
  lastSyncedAt?: string;
  lastError?: string;
}

export const liveSessionService = {
  // Get all live sessions with filters
  async getSessions(
    filters?: LiveSessionFilters,
    token?: string
  ): Promise<PaginatedResponse<LiveSession>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get<PaginatedResponse<LiveSession>>(
      `/live-sessions${query}`,
      { token }
    );
  },

  async getMySessions(token: string): Promise<{ success: boolean; data: { sessions: LiveSession[] } }> {
    return apiClient.get("/live-sessions/mine", { token });
  },

  async getMeetingIdentity(token: string): Promise<{ success: boolean; data: { identity: MeetingIdentity | null } }> {
    return apiClient.get("/live-sessions/meeting-identity", { token });
  },

  async setMeetingIdentity(teamsEmail: string, token: string, resend = false): Promise<{ success: boolean; data: { identity: MeetingIdentity } }> {
    return apiClient.post("/live-sessions/meeting-identity", { teamsEmail, resend }, { token });
  },

  // Get session by ID
  async getSessionById(
    id: string,
    token?: string
  ): Promise<ApiResponse<LiveSession>> {
    return apiClient.get<ApiResponse<LiveSession>>(`/live-sessions/${id}`, {
      token,
    });
  },

  // Create new live session (tutor only)
  async createSession(
    data: CreateLiveSessionData,
    token: string
  ): Promise<CreateSessionResponse> {
    return apiClient.post<CreateSessionResponse>("/live-sessions", data, {
      token,
    });
  },

  // Update live session (tutor only)
  async updateSession(
    id: string,
    data: Partial<CreateLiveSessionData>,
    token: string
  ): Promise<ApiResponse<LiveSession>> {
    return apiClient.put<ApiResponse<LiveSession>>(
      `/live-sessions/${id}`,
      data,
      { token }
    );
  },

  // Cancel session (tutor only)
  async cancelSession(
    id: string,
    token: string
  ): Promise<ApiResponse<LiveSession>> {
    return apiClient.delete<ApiResponse<LiveSession>>(
      `/live-sessions/${id}`,
      { token }
    );
  },

  // Start live session (tutor only)
  async startSession(
    id: string,
    token: string
  ): Promise<ApiResponse<LiveSession>> {
    return apiClient.post<ApiResponse<LiveSession>>(
      `/live-sessions/${id}/start`,
      {},
      { token }
    );
  },

  // End live session (tutor only)
  async endSession(
    id: string,
    token: string
  ): Promise<ApiResponse<LiveSession>> {
    return apiClient.post<ApiResponse<LiveSession>>(
      `/live-sessions/${id}/end`,
      {},
      { token }
    );
  },

  // Enroll in session (student)
  async enrollInSession(
    id: string,
    data: EnrollSessionData,
    token: string
  ): Promise<ApiResponse<SessionEnrollment>> {
    return apiClient.post<ApiResponse<SessionEnrollment>>(
      `/live-sessions/${id}/enroll`,
      data,
      { token }
    );
  },

  // Get my enrollments (student)
  async getMyEnrollments(
    filters?: { upcoming?: boolean },
    token?: string
  ): Promise<PaginatedResponse<SessionEnrollment>> {
    const queryParams = new URLSearchParams();
    if (filters?.upcoming !== undefined) {
      queryParams.append("upcoming", String(filters.upcoming));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get<PaginatedResponse<SessionEnrollment>>(
      `/live-sessions/my/enrollments${query}`,
      { token }
    );
  },

  // Join live session (student)
  async joinSession(
    id: string,
    token: string
  ): Promise<JoinSessionResponse> {
    return apiClient.post<JoinSessionResponse>(
      `/live-sessions/${id}/join`,
      {},
      { token }
    );
  },

  // Leave live session (student)
  async leaveSession(
    id: string,
    token: string
  ): Promise<ApiResponse<SessionEnrollment>> {
    return apiClient.post<ApiResponse<SessionEnrollment>>(
      `/live-sessions/${id}/leave`,
      {},
      { token }
    );
  },

  // Get session enrollments (tutor)
  async getSessionEnrollments(
    id: string,
    token: string
  ): Promise<PaginatedResponse<SessionEnrollment>> {
    return apiClient.get<PaginatedResponse<SessionEnrollment>>(
      `/live-sessions/${id}/enrollments`,
      { token }
    );
  },

  // Invite students to session (tutor)
  async inviteStudents(
    id: string,
    data: InviteStudentsData,
    token: string
  ): Promise<ApiResponse<{ invited: number; failed: number }>> {
    return apiClient.post<ApiResponse<{ invited: number; failed: number }>>(
      `/live-sessions/${id}/invite`,
      data,
      { token }
    );
  },
};

export default liveSessionService;
