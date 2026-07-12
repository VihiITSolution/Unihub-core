import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

export interface PlatformStats {
  activeStudents: number;
  tutors: number;
  sessions: number;
  averageRating: string | null;
  totalReviews: number;
}

export const statsService = {
  async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    return apiClient.get<ApiResponse<PlatformStats>>("/stats/platform");
  },
};
