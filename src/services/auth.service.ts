import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User, AuthState, StudentProfile } from '@/types';

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
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: ('student' | 'tutor' | 'vendor' | 'admin')[];
  primaryRole?: 'student' | 'tutor' | 'vendor' | 'admin';
  phoneNumber?: string;
  studentProfile?: StudentProfileData;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  },

  async logout(token: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/logout', {}, { token });
  },

  async getCurrentUser(token: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<ApiResponse<{ user: User }>>('/auth/profile', { token });
  },

  async refreshToken(token: string): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh',
      {},
      { token }
    );
  },
};

