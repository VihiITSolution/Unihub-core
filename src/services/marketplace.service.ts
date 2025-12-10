import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, Product, Order } from '@/types';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  title: string;
  description: string;
  images: string[];
  price: number;
  category: string;
  stock: number;
}

export const marketplaceService = {
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<Product>>(`/products${query}`);
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  },

  async createProduct(
    data: CreateProductData,
    token: string
  ): Promise<ApiResponse<Product>> {
    return apiClient.post<ApiResponse<Product>>('/products', data, { token });
  },

  async updateProduct(
    id: string,
    data: Partial<CreateProductData>,
    token: string
  ): Promise<ApiResponse<Product>> {
    return apiClient.put<ApiResponse<Product>>(`/products/${id}`, data, { token });
  },

  async deleteProduct(id: string, token: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/products/${id}`, { token });
  },

  async createOrder(
    productId: string,
    quantity: number,
    token: string
  ): Promise<ApiResponse<Order>> {
    return apiClient.post<ApiResponse<Order>>(
      '/orders',
      { productId, quantity },
      { token }
    );
  },

  async getOrders(token: string): Promise<ApiResponse<Order[]>> {
    return apiClient.get<ApiResponse<Order[]>>('/orders', { token });
  },

  async getSellerProducts(token: string): Promise<ApiResponse<Product[]>> {
    return apiClient.get<ApiResponse<Product[]>>('/seller/products', { token });
  },
};
