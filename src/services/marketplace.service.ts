import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse, MarketplaceItem, Order } from '@/types';

export interface MarketplaceFilters {
  category?: string;
  itemType?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  itemType: 'book' | 'notes' | 'equipment' | 'electronics' | 'other';
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  price: number;
  stock: number;
  images?: string[];
  location?: string;
  contactInfo?: string;
}

export interface CreateOrderData {
  itemId: number;
  quantity: number;
  shippingAddress?: string;
  buyerNotes?: string;
}

export interface UpdateOrderData {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  trackingNumber?: string;
  sellerNotes?: string;
}

export interface PaymentInfo {
  requiresPayment: boolean;
  adFee?: number;
  paymentMethods: {
    payhere: boolean;
    helapay: boolean;
    bankTransfer: boolean;
  };
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
  };
}

export interface PaymentData {
  method: 'payhere' | 'helapay' | 'bank_transfer';
  returnUrl: string;
  cancelUrl: string;
}

export interface BankTransferProofData {
  proofImage: string; // Base64 string or URL
  transactionDate: string;
  transactionReference?: string;
}

export const marketplaceService = {
  /**
   * Get all marketplace items with filters
   */
  async getItems(filters?: MarketplaceFilters): Promise<PaginatedResponse<MarketplaceItem>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await apiClient.get<any>(`/marketplace${query}`);
    return {
      success: response.success,
      data: response.data.items,
      pagination: response.data.pagination
    };
  },

  /**
   * Get marketplace item by ID
   */
  async getItemById(id: number): Promise<ApiResponse<{ item: MarketplaceItem }>> {
    return apiClient.get<ApiResponse<{ item: MarketplaceItem }>>(`/marketplace/${id}`);
  },

  /**
   * Create marketplace listing (vendor only)
   */
  async createListing(
    data: CreateListingData,
    token: string
  ): Promise<ApiResponse<{ item: MarketplaceItem }>> {
    return apiClient.post<ApiResponse<{ item: MarketplaceItem }>>(
      '/marketplace',
      data,
      { token }
    );
  },

  /**
   * Update marketplace listing
   */
  async updateListing(
    id: number,
    data: Partial<CreateListingData>,
    token: string
  ): Promise<ApiResponse<{ item: MarketplaceItem }>> {
    return apiClient.put<ApiResponse<{ item: MarketplaceItem }>>(
      `/marketplace/${id}`,
      data,
      { token }
    );
  },

  /**
   * Delete marketplace listing
   */
  async deleteListing(id: number, token: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/marketplace/${id}`, { token });
  },

  /**
   * Get my listings (vendor only)
   */
  async getMyListings(token: string): Promise<ApiResponse<{ items: MarketplaceItem[] }>> {
    return apiClient.get<ApiResponse<{ items: MarketplaceItem[] }>>(
      '/marketplace/my-listings',
      { token }
    );
  },

  /**
   * Create order
   */
  async createOrder(
    data: CreateOrderData,
    token: string
  ): Promise<ApiResponse<{ order: Order }>> {
    return apiClient.post<ApiResponse<{ order: Order }>>(
      '/marketplace/orders',
      data,
      { token }
    );
  },

  /**
   * Get my orders (buyer view)
   */
  async getMyOrders(
    filters?: { status?: string; page?: number; limit?: number },
    token?: string
  ): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await apiClient.get<any>(`/marketplace/orders${query}`, { token });
    return {
      success: response.success,
      data: response.data.orders,
      pagination: response.data.pagination
    };
  },

  /**
   * Get my sales (seller view)
   */
  async getMySales(
    filters?: { status?: string; page?: number; limit?: number },
    token?: string
  ): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await apiClient.get<any>(`/marketplace/sales${query}`, { token });
    return {
      success: response.success,
      data: response.data.orders,
      pagination: response.data.pagination
    };
  },

  /**
   * Update order status (seller only)
   */
  async updateOrderStatus(
    orderId: number,
    data: UpdateOrderData,
    token: string
  ): Promise<ApiResponse<{ order: Order }>> {
    return apiClient.put<ApiResponse<{ order: Order }>>(
      `/marketplace/orders/${orderId}`,
      data,
      { token }
    );
  },

  /**
   * Get payment information for a listing
   */
  async getPaymentInfo(
    itemId: number,
    token: string
  ): Promise<ApiResponse<PaymentInfo>> {
    return apiClient.get<ApiResponse<PaymentInfo>>(
      `/marketplace/${itemId}/payment-info`,
      { token }
    );
  },

  /**
   * Initiate payment for a listing
   */
  async initiatePayment(
    itemId: number,
    data: PaymentData,
    token: string
  ): Promise<ApiResponse<{ paymentUrl?: string; formData?: any; paymentId: number }>> {
    return apiClient.post<ApiResponse<any>>(
      `/marketplace/${itemId}/pay`,
      data,
      { token }
    );
  },

  /**
   * Submit bank transfer proof
   */
  async submitBankTransferProof(
    itemId: number,
    data: BankTransferProofData,
    token: string
  ): Promise<ApiResponse<{ payment: any }>> {
    return apiClient.post<ApiResponse<any>>(
      `/marketplace/${itemId}/bank-transfer`,
      data,
      { token }
    );
  }
};
