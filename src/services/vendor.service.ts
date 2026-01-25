import { apiClient } from '@/lib/api-client';
import type { ApiResponse, VendorProfile } from '@/types';

export interface CreateVendorProfileData {
  shopName: string;
  shopDescription?: string;
  businessType?: 'individual' | 'business';
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
}

export interface UpdateVendorProfileData {
  shopName?: string;
  shopDescription?: string;
  businessType?: 'individual' | 'business';
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  isActive?: boolean;
}

export interface VendorStats {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export const vendorService = {
  /**
   * Create vendor profile
   */
  async createProfile(
    data: CreateVendorProfileData,
    token: string
  ): Promise<ApiResponse<{ vendorProfile: VendorProfile }>> {
    return apiClient.post<ApiResponse<{ vendorProfile: VendorProfile }>>(
      '/profile/vendor',
      data,
      { token }
    );
  },

  /**
   * Get my vendor profile
   */
  async getMyProfile(token: string): Promise<ApiResponse<{ vendorProfile: VendorProfile }>> {
    return apiClient.get<ApiResponse<{ vendorProfile: VendorProfile }>>(
      '/profile/vendor',
      { token }
    );
  },

  /**
   * Get vendor profile by user ID (public)
   */
  async getProfileByUserId(userId: number): Promise<ApiResponse<{ vendorProfile: VendorProfile }>> {
    return apiClient.get<ApiResponse<{ vendorProfile: VendorProfile }>>(
      `/profile/vendor/${userId}`
    );
  },

  /**
   * Update vendor profile
   */
  async updateProfile(
    data: UpdateVendorProfileData,
    token: string
  ): Promise<ApiResponse<{ vendorProfile: VendorProfile }>> {
    return apiClient.put<ApiResponse<{ vendorProfile: VendorProfile }>>(
      '/profile/vendor',
      data,
      { token }
    );
  },

  /**
   * Get vendor statistics
   */
  async getStats(token: string): Promise<ApiResponse<{ stats: VendorStats }>> {
    return apiClient.get<ApiResponse<{ stats: VendorStats }>>(
      '/profile/vendor/stats',
      { token }
    );
  }
};
