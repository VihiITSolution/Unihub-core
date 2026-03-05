import { apiClient } from "@/lib/api-client";
import type { ApiResponse, TutorProfile } from "@/types";

export interface ApplyAsTutorData {
  qualifications?: string;
  expertiseAreas: string[];
  bio?: string;
  yearsOfExperience?: number;
}

export interface UpdateTutorProfileData {
  qualifications?: string;
  expertiseAreas?: string[];
  bio?: string;
  yearsOfExperience?: number;
}

export const tutorService = {
  /**
   * Apply to become a tutor (creates tutor profile with pending status)
   */
  async applyAsTutor(
    data: ApplyAsTutorData,
    token: string,
  ): Promise<ApiResponse<{ profile: TutorProfile }>> {
    return apiClient.post<ApiResponse<{ profile: TutorProfile }>>(
      "/profile/tutor/apply",
      data,
      { token },
    );
  },

  /**
   * Get my tutor profile
   */
  async getMyProfile(
    token: string,
  ): Promise<ApiResponse<{ profile: TutorProfile }>> {
    return apiClient.get<ApiResponse<{ profile: TutorProfile }>>(
      "/profile/tutor",
      { token },
    );
  },

  /**
   * Update tutor profile
   */
  async updateProfile(
    data: UpdateTutorProfileData,
    token: string,
  ): Promise<ApiResponse<{ profile: TutorProfile }>> {
    return apiClient.put<ApiResponse<{ profile: TutorProfile }>>(
      "/profile/tutor",
      data,
      { token },
    );
  },
};
