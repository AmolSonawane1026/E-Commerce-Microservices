import apiClient, { API_ENDPOINTS } from '../config/api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.ORDERS}/api/orders`,
      orderData
    );
    return response.data;
  },

  // Get customer's orders
  getMyOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_ENDPOINTS.ORDERS}/api/orders/my-orders${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.ORDERS}/api/orders/${orderId}`
    );
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.ORDERS}/api/orders/${orderId}/cancel`,
      { reason }
    );
    return response.data;
  }
};
