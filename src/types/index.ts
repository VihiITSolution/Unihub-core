// User types
export type UserRole = "student" | "tutor" | "vendor" | "admin";

export interface StudentProfile {
  id: number;
  userId: number;
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
  isProfileComplete: boolean;
}

export interface TutorProfile {
  id: number;
  userId: number;
  qualifications?: string;
  expertiseAreas: string[];
  bio?: string;
  yearsOfExperience: number;
  isApproved: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  isProfileComplete: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  primaryRole: UserRole;
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  isStudentProfileComplete: boolean;
  isTutorProfileComplete: boolean;
  studentProfile?: StudentProfile;
  tutorProfile?: TutorProfile;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  tutorId: string;
  tutorName?: string;
  tutorAvatar?: string;
  tutor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    bio?: string;
  };
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in minutes
  enrolledCount?: number;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseContent {
  id: string;
  courseId: string;
  title: string;
  type: "video" | "pdf" | "quiz";
  url?: string;
  duration?: number;
  order: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  progress: number;
  completedAt?: string;
  enrolledAt: string;
}

// Marketplace types
export interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  sellerId: string;
  sellerName: string;
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  type: "course_enrollment" | "product_purchase";
  metadata: {
    itemId: string;
    userId: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
