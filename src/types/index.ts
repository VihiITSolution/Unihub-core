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
  studentEmail?: string;
  studentEmailVerifiedAt?: string;
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
  verifiedPhoneNumber?: string;
  phoneVerifiedAt?: string;
  bio?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  isStudentProfileComplete: boolean;
  isTutorProfileComplete: boolean;
  isVendorProfileComplete: boolean;
  studentProfile?: StudentProfile;
  tutorProfile?: TutorProfile;
  vendorProfile?: VendorProfile;
  createdAt: string;
  lastLogin?: string;
}

export interface VendorProfile {
  id: number;
  userId: number;
  shopName: string;
  shopDescription?: string;
  businessType: "individual" | "business";
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  isApproved: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  isProfileComplete: boolean;
  state?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdByTutorId?: number;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  aboutCourse?: string;
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
  categoryId?: number;
  category: string;
  categoryObj?: Category;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in hours (total course length, distinct from CourseContent.duration which is per-lesson minutes)
  durationMinutes?: number; // remaining minutes in the total course duration
  facultyId?: number;
  departmentId?: number;
  year?: number;
  faculty?: {
    id: number;
    name: string;
    icon?: string;
  };
  department?: {
    id: number;
    name: string;
    slug?: string;
  };
  enrolledCount?: number;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  isEnrolled?: boolean;
  isUpcoming?: boolean; // Mark course as upcoming
  approvalStatus?: "pending" | "approved" | "rejected" | "draft";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  helpful?: number;
}

export interface CourseContent {
  id: string;
  courseId: string;
  title: string;
  type: "video" | "pdf" | "quiz";
  url?: string;
  youtubeVideoId?: string;
  duration?: number;
  order: number;
  isPreview?: boolean;
  locked?: boolean;
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
export interface MarketplaceItem {
  id: number;
  sellerId: number;
  title: string;
  description: string;
  category: string;
  itemType: "book" | "notes" | "equipment" | "electronics" | "other";
  condition: "new" | "like_new" | "good" | "fair" | "poor";
  price: number;
  images?: string[];
  stock: number;
  soldCount: number;
  location?: string;
  isAvailable: boolean;
  viewCount: number;
  contactInfo?: string;
  // Payment and approval fields
  isPaid: boolean;
  adFee?: number;
  paidAt?: string;
  paymentId?: number;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
  requiresPayment: boolean;
  seller?: {
    id: number | string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    vendorProfile?: any;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderId: string;
  buyerId: number;
  sellerId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  shippingAddress?: string;
  buyerNotes?: string;
  sellerNotes?: string;
  trackingNumber?: string;
  paymentId?: number;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  item?: MarketplaceItem;
  buyer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Legacy Product type for compatibility (maps to MarketplaceItem)
export interface Product extends Omit<
  MarketplaceItem,
  "itemType" | "condition" | "soldCount"
> {
  sellerName?: string;
  rating?: number;
  reviewCount?: number;
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

// Live Session types
export type LiveSessionStatus =
  | "scheduled"
  | "cancelled"
  | "live"
  | "ended"
  | "recorded";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type InvitationStatus = "pending" | "accepted" | "declined";
export type LiveSessionProvider = "youtube" | "teams";
export type LiveSessionApprovalStatus = "pending" | "approved" | "rejected";
export type LiveSessionProviderStatus =
  | "not_provisioned"
  | "provisioning"
  | "ready"
  | "syncing"
  | "failed"
  | "cancelled";

export interface LiveSession {
  id: string;
  tutorId: string;
  courseId?: string;
  title: string;
  description?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  isFree: boolean;
  price: number;
  platformCommissionRate: number;
  maxAttendees?: number;
  youtubeVideoId?: string;
  youtubeBroadcastId?: string;
  youtubeStreamKey?: string;
  streamUrl?: string;
  embedUrl?: string;
  status: LiveSessionStatus;
  totalRevenue: number;
  platformCommission: number;
  totalAttendees: number;
  allowRecording: boolean;
  provider: LiveSessionProvider;
  approvalStatus: LiveSessionApprovalStatus;
  providerStatus: LiveSessionProviderStatus;
  rejectionReason?: string;
  approvedAt?: string;
  recordingUrl?: string;
  enableChat: boolean;
  privacyStatus: "public" | "unlisted" | "private";
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  tutor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  course?: Course;
}

export interface SessionEnrollment {
  id: string;
  sessionId: string;
  studentId: string;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  joinedAt?: string;
  leftAt?: string;
  attendanceDuration: number;
  invitedBy?: string;
  invitationStatus?: InvitationStatus;
  joinLaunchedAt?: string;
  attended?: boolean;
  attendanceIntervals?: Array<{
    joinDateTime: string;
    leaveDateTime: string;
    durationInSeconds: number;
  }>;
  attendanceSource?: "unihub" | "teams";
  attendanceSyncStatus?: "pending" | "synced" | "unmatched" | "failed";
  createdAt: string;
  updatedAt: string;
  session?: LiveSession;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
}

export interface CreateLiveSessionData {
  title: string;
  description?: string;
  courseId?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  isFree: boolean;
  price?: number;
  platformCommissionRate?: number;
  maxAttendees?: number;
  allowRecording?: boolean;
  enableChat?: boolean;
  privacyStatus?: "public" | "unlisted" | "private";
  tags?: string[];
  teamsEmail: string;
}

export interface LiveSessionFilters {
  upcoming?: boolean;
  tutorId?: string;
  isFree?: boolean;
  status?: LiveSessionStatus;
  page?: number;
  limit?: number;
}

// Boarding Places types
export type RoomType = "single" | "shared" | "apartment" | "annex";
export type GenderPreference = "male" | "female" | "any";
export type BoardingApprovalStatus = "pending" | "approved" | "rejected";

export interface BoardingPlace {
  id: number;
  vendorId: number;
  title: string;
  description: string;
  address: string;
  city: string;
  district?: string;
  nearestUniversity?: string;
  distanceToUniversity?: number;
  roomType: RoomType;
  genderPreference: GenderPreference;
  capacity: number;
  availableSlots: number;
  monthlyRent: number;
  securityDeposit?: number;
  amenities?: string[];
  rules?: string;
  images?: string[];
  videos?: string[];
  contactPhone: string;
  contactEmail?: string;
  isActive: boolean;
  isPaid: boolean;
  paidAt?: string;
  adFee: number;
  expiresAt?: string;
  viewCount: number;
  inquiryCount: number;
  isApproved: boolean;
  approvalStatus: BoardingApprovalStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    vendorProfile?: {
      shopName: string;
      contactPhone?: string;
      contactEmail?: string;
    };
  };
}

export interface BoardingPlaceFilters {
  city?: string;
  roomType?: RoomType;
  genderPreference?: GenderPreference;
  minRent?: number;
  maxRent?: number;
  nearestUniversity?: string;
  page?: number;
  limit?: number;
}

export interface BoardingPlaceFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  district?: string;
  nearestUniversity?: string;
  distanceToUniversity?: number;
  roomType: RoomType;
  genderPreference: GenderPreference;
  capacity: number;
  monthlyRent: number;
  securityDeposit?: number;
  amenities?: string[];
  rules?: string;
  images?: string[];
  videos?: string[];
  contactPhone: string;
  contactEmail?: string;
}
