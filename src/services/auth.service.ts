import { apiClient } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/constants";
import type { ApiResponse, User, AuthState, StudentProfile } from "@/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentProfileData {
  universityName: string;
  department: string;
  degreeOrCourse: string;
  studyingArea?: string;
  currentYear: number;
  currentSemester: number;
  studentIdNumber?: string;
  currentAddress?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  facultyId?: number;
  customUniversity?: string;
  customFaculty?: string;
  customDepartment?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: ("student" | "tutor" | "vendor" | "admin")[];
  primaryRole?: "student" | "tutor" | "vendor" | "admin";
  phoneNumber?: string;
  studentProfile?: StudentProfileData;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
  },

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data);
  },

  async forgotPassword(
    email: string,
  ): Promise<ApiResponse<{ resetToken?: string; resetUrl?: string }>> {
    return apiClient.post<ApiResponse<{ resetToken?: string; resetUrl?: string }>>(
      "/auth/forgot-password",
      { email },
    );
  },

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>("/auth/reset-password", {
      email,
      token,
      newPassword,
    });
  },

  async changePassword(
    token: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<null>> {
    return apiClient.put<ApiResponse<null>>(
      "/auth/change-password",
      { currentPassword, newPassword },
      { token },
    );
  },

  async logout(token: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>("/auth/logout", {}, { token });
  },

  async getCurrentUser(token: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<ApiResponse<{ user: User }>>("/auth/profile", {
      token,
    });
  },

  async refreshToken(token: string): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<ApiResponse<{ token: string }>>(
      "/auth/refresh",
      {},
      { token },
    );
  },

  async updateProfile(
    token: string,
    data: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      bio?: string;
      profileImage?: string;
    },
  ): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put<ApiResponse<{ user: User }>>("/auth/profile", data, {
      token,
    });
  },

  async uploadProfilePhoto(
    token: string,
    file: File,
  ): Promise<ApiResponse<{ user: User; profileImage: string }>> {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await fetch(`${API_BASE_URL}/auth/profile/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload profile photo");
    }

    return response.json();
  },

  async switchRole(
    token: string,
    primaryRole: "student" | "tutor" | "vendor" | "admin",
  ): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post<ApiResponse<{ user: User }>>(
      "/auth/switch-role",
      { primaryRole },
      { token },
    );
  },
};
