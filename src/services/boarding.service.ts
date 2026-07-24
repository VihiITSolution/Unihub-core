import { BoardingPlace, BoardingPlaceFilters, BoardingPlaceFormData } from '@/types';
import { apiClient } from '@/lib/api-client';
import { API_BASE_URL } from '@/lib/constants';
import type { ApiResponse } from '@/types';

class BoardingService {
  private baseUrl = '/boarding';

  // Upload images for a boarding listing (returns Cloudinary URLs)
  async uploadImages(
    files: File[],
    token: string,
  ): Promise<ApiResponse<{ images: string[] }>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/upload-images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    return response.json();
  }

  // Upload videos for a boarding listing (returns Cloudinary URLs)
  async uploadVideos(
    files: File[],
    token: string,
  ): Promise<ApiResponse<{ videos: string[] }>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('videos', file));

    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/upload-videos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    return response.json();
  }

  // Create a new boarding place listing
  async createListing(data: BoardingPlaceFormData): Promise<BoardingPlace> {
    return apiClient.post(`${this.baseUrl}/places`, data);
  }

  // Pay for a boarding listing
  async payForListing(
    id: number,
    paymentData: { paymentMethod: string; transactionId?: string }
  ): Promise<BoardingPlace> {
    return apiClient.post(`${this.baseUrl}/places/${id}/pay`, paymentData);
  }

  // Get all boarding places (public, with filters)
  async getListings(filters?: BoardingPlaceFilters): Promise<{
    places: BoardingPlace[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`${this.baseUrl}/places?${params.toString()}`);
  }

  // Get single boarding place by ID
  async getListingById(id: number): Promise<BoardingPlace> {
    return apiClient.get(`${this.baseUrl}/places/${id}`);
  }

  // Get my boarding listings (vendor only)
  async getMyListings(): Promise<BoardingPlace[]> {
    const response = await apiClient.get(`${this.baseUrl}/my-listings`);
    return (response as any).places || (response as unknown as { data: { places: BoardingPlace[] } }).data?.places;
  }

  // Update boarding listing
  async updateListing(
    id: number,
    data: Partial<BoardingPlaceFormData>
  ): Promise<BoardingPlace> {
    return apiClient.patch(`${this.baseUrl}/places/${id}`, data);
  }

  // Delete boarding listing
  async deleteListing(id: number): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/places/${id}`);
  }

  // Increment inquiry count (when someone contacts)
  async recordInquiry(id: number): Promise<void> {
    return apiClient.post(`${this.baseUrl}/places/${id}/inquire`);
  }
}

export const boardingService = new BoardingService();
