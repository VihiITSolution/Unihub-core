import { apiClient } from '@/lib/api-client';

export interface University {
  id: number;
  name: string;
  shortName?: string;
  city: string;
  district?: string;
  province?: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: 'public' | 'private' | 'international';
  website?: string;
  distance?: number;
}

export interface GetUniversitiesParams {
  city?: string;
  type?: 'public' | 'private' | 'international';
  search?: string;
}

export interface GetNearestUniversitiesParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

export const universityService = {
  /**
   * Get all universities
   */
  async getUniversities(params?: GetUniversitiesParams): Promise<{
    success: boolean;
    data: { universities: University[] };
    count: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append('city', params.city);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiClient.get<any>(`/universities${query}`);
    return response.data;
  },

  /**
   * Get nearest universities based on user's location
   */
  async getNearestUniversities(params: GetNearestUniversitiesParams): Promise<{
    success: boolean;
    data: {
      universities: University[];
      userLocation: { latitude: number; longitude: number };
      radius: number;
    };
    count: number;
  }> {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
    });
    
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(`/universities/nearest?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get university by ID
   */
  async getUniversityById(id: number): Promise<{
    success: boolean;
    data: { university: University };
  }> {
    const response = await apiClient.get<any>(`/universities/${id}`);
    return response.data;
  },

  /**
   * Get list of cities with universities
   */
  async getUniversityCities(): Promise<{
    success: boolean;
    data: { cities: string[] };
  }> {
    const response = await apiClient.get<any>('/universities/cities');
    return response.data;
  },

  /**
   * Get user's current position using Geolocation API
   */
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  },
};
