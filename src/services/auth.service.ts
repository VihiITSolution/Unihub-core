import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User, AuthState } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'tutor' | 'seller';
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthState>> {
    return apiClient.post<ApiResponse<AuthState>>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<ApiResponse<AuthState>> {
    return apiClient.post<ApiResponse<AuthState>>('/auth/register', data);
  },

  async logout(token: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/logout', {}, { token });
  },

  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>('/auth/me', { token });
  },

  async refreshToken(token: string): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh',
      {},
      { token }
    );
  },
};
