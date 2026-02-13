import { apiClient } from "@/lib/api-client";

// Helper function to get token
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("unihub_token");
  }
  return null;
};

export interface Enrollment {
  id: number;
  learnerId: number;
  courseId: number;
  status: "enrolled" | "in_progress" | "completed" | "cancelled";
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  course?: {
    id: number;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
    category: string;
    level: string;
    duration: number;
    tutor?: {
      id: number;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  };
}

export interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  paymentMethod: string;
}

export interface EnrollmentWithPayment {
  courseId: number;
  paymentData: PaymentData;
  amount: number;
}

const enrollmentService = {
  /**
   * Enroll in a course with payment
   */
  async enrollInCourse(data: EnrollmentWithPayment): Promise<{
    success: boolean;
    message?: string;
    data?: { enrollment: Enrollment; payment: any };
  }> {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          message: "Authentication required. Please login.",
        };
      }

      // Step 1: Create enrollment
      const enrollmentResponse = await apiClient.post<{
        success: boolean;
        message: string;
        data: { enrollment: Enrollment };
      }>("/enrollments", { courseId: data.courseId }, { token });

      if (!enrollmentResponse.success) {
        return {
          success: false,
          message: enrollmentResponse.message || "Failed to enroll in course",
        };
      }

      const enrollment = enrollmentResponse.data.enrollment;

      // Step 2: Process payment
      try {
        const paymentResponse = await apiClient.post<{
          success: boolean;
          data: any;
        }>(
          "/payments",
          {
            enrollmentId: enrollment.id,
            amount: data.amount,
            paymentMethod: data.paymentData.paymentMethod,
          },
          { token },
        );

        return {
          success: true,
          message: "Successfully enrolled in course",
          data: {
            enrollment,
            payment: paymentResponse.data.data,
          },
        };
      } catch (paymentError) {
        console.error("Payment failed:", paymentError);
        // Enrollment is created but payment failed
        return {
          success: true,
          message: "Enrolled successfully (payment processing pending)",
          data: {
            enrollment,
            payment: null,
          },
        };
      }
    } catch (error: any) {
      console.error("Enrollment error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to enroll in course",
      };
    }
  },

  /**
   * Get user's enrollments
   */
  async getMyEnrollments(): Promise<{
    success: boolean;
    data?: { enrollments: Enrollment[] };
  }> {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          data: { enrollments: [] },
        };
      }

      const response = await apiClient.get<{
        success: boolean;
        data: { enrollments: Enrollment[] };
      }>("/enrollments", { token });
      return {
        success: response.success,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to fetch enrollments:", error);
      return {
        success: false,
        data: { enrollments: [] },
      };
    }
  },

  /**
   * Check if user is enrolled in a specific course
   */
  async checkEnrollment(courseId: number): Promise<{
    success: boolean;
    data?: { isEnrolled: boolean; enrollment: Enrollment | null };
  }> {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          data: { isEnrolled: false, enrollment: null },
        };
      }

      const response = await apiClient.get<{
        success: boolean;
        data: { isEnrolled: boolean; enrollment: Enrollment | null };
      }>(`/enrollments/check/${courseId}`, { token });

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to check enrollment:", error);
      return {
        success: false,
        data: { isEnrolled: false, enrollment: null },
      };
    }
  },

  /**
   * Update enrollment progress
   */
  async updateProgress(
    enrollmentId: number,
    progress: number,
    status?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          message: "Authentication required",
        };
      }

      const response = await apiClient.put<{
        success: boolean;
        message: string;
      }>(
        `/enrollments/${enrollmentId}/progress`,
        { progress, status },
        { token },
      );

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      console.error("Failed to update progress:", error);
      return {
        success: false,
        message: "Failed to update progress",
      };
    }
  },

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(
    enrollmentId: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`/enrollments/${enrollmentId}`);
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      console.error("Failed to cancel enrollment:", error);
      return {
        success: false,
        message: "Failed to cancel enrollment",
      };
    }
  },

  /**
   * Get all students enrolled in tutor's courses
   */
  async getTutorStudents(token: string): Promise<{
    success: boolean;
    message?: string;
    data?: {
      students: Array<{
        enrollmentId: number;
        enrolledAt: string;
        progress: number;
        completedAt?: string;
        student: {
          id: number;
          firstName: string;
          lastName: string;
          email: string;
          university?: string;
          department?: string;
          degree?: string;
        };
        course: {
          id: number;
          title: string;
          thumbnail?: string;
        };
      }>;
      totalStudents: number;
    };
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message?: string;
        data: {
          students: Array<{
            enrollmentId: number;
            enrolledAt: string;
            progress: number;
            completedAt?: string;
            student: {
              id: number;
              firstName: string;
              lastName: string;
              email: string;
              university?: string;
              department?: string;
              degree?: string;
            };
            course: {
              id: number;
              title: string;
              thumbnail?: string;
            };
          }>;
          totalStudents: number;
        };
      }>("/enrollments/tutor/students", { token });

      return {
        success: response.success,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to load tutor students:", error);
      return {
        success: false,
        message: "Failed to load enrolled students",
      };
    }
  },
};

export default enrollmentService;
