import { apiClient } from "@/lib/api-client";

// Helper function to get token
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("unihub_token");
  }
  return null;
};

export interface Review {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export interface ReviewData {
  courseId: number;
  rating: number;
  comment?: string;
}

const reviewService = {
  /**
   * Add or update a review
   */
  async addReview(data: ReviewData): Promise<{
    success: boolean;
    message?: string;
    data?: { review: Review };
  }> {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          message: "Authentication required",
        };
      }

      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: { review: Review };
      }>("/reviews", data, { token });

      return {
        success: response.success,
        message: response.message,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to add review:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add review",
      };
    }
  },

  /**
   * Get reviews for a course
   */
  async getCourseReviews(
    courseId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    success: boolean;
    data?: {
      reviews: Review[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          reviews: Review[];
          pagination: any;
        };
      }>(`/reviews/course/${courseId}?page=${page}&limit=${limit}`);

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      return {
        success: false,
        data: {
          reviews: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };
    }
  },

  /**
   * Get user's review for a specific course
   */
  async getUserReview(courseId: number): Promise<{
    success: boolean;
    data?: { review: Review | null };
  }> {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          data: { review: null },
        };
      }

      const response = await apiClient.get<{
        success: boolean;
        data: { review: Review | null };
      }>(`/reviews/my-review/${courseId}`, { token });

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to fetch user review:", error);
      return {
        success: false,
        data: { review: null },
      };
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          message: "Authentication required",
        };
      }

      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/reviews/${reviewId}`, { token });

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      return {
        success: false,
        message: "Failed to delete review",
      };
    }
  },
};

export default reviewService;
