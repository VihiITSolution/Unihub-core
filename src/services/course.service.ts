import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Course,
  CourseContent,
  Enrollment,
} from "@/types";

export interface CourseFilters {
  category?: string;
  level?: string;
  facultyId?: number;
  departmentId?: number;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  durationMinutes?: number;
  facultyId?: number;
  departmentId?: number;
  year?: number;
}

export const courseService = {
  async getCourses(
    filters?: CourseFilters,
  ): Promise<PaginatedResponse<Course>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get<PaginatedResponse<Course>>(`/courses${query}`);
  },

  async getCourseById(id: string): Promise<ApiResponse<{ course: Course }>> {
    return apiClient.get<ApiResponse<{ course: Course }>>(`/courses/${id}`);
  },

  async getCourseContent(
    courseId: string,
    token: string,
  ): Promise<ApiResponse<CourseContent[]>> {
    return apiClient.get<ApiResponse<CourseContent[]>>(
      `/courses/${courseId}/content`,
      { token },
    );
  },

  async createCourse(
    data: CreateCourseData,
    token: string,
  ): Promise<ApiResponse<Course>> {
    return apiClient.post<ApiResponse<Course>>("/courses", data, { token });
  },

  async updateCourse(
    id: string,
    data: Partial<CreateCourseData>,
    token: string,
  ): Promise<ApiResponse<Course>> {
    return apiClient.put<ApiResponse<Course>>(`/courses/${id}`, data, {
      token,
    });
  },

  async deleteCourse(id: string, token: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/courses/${id}`, { token });
  },

  async enrollInCourse(
    courseId: string,
    token: string,
  ): Promise<ApiResponse<Enrollment>> {
    return apiClient.post<ApiResponse<Enrollment>>(
      "/enrollments",
      { courseId: parseInt(courseId) }, // Backend expects courseId as integer in body
      { token },
    );
  },

  async getEnrollments(token: string): Promise<ApiResponse<Enrollment[]>> {
    return apiClient.get<ApiResponse<Enrollment[]>>("/enrollments", { token });
  },

  async getTutorCourses(token: string): Promise<ApiResponse<Course[]>> {
    return apiClient.get<ApiResponse<Course[]>>("/courses/my-courses", {
      token,
    });
  },

  async submitForReview(
    id: string,
    token: string,
  ): Promise<ApiResponse<Course>> {
    return apiClient.post<ApiResponse<Course>>(
      `/courses/${id}/submit-for-review`,
      {},
      { token },
    );
  },
};
