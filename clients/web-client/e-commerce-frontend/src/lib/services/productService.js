import apiClient, { API_ENDPOINTS } from '../config/api';

export const productService = {
  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_ENDPOINTS.PRODUCTS}/api/products${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/api/products/${id}`);
    return response.data;
  },

  searchProducts: async (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_ENDPOINTS.PRODUCTS}/api/products/search?${queryString}`
    );
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/api/products/categories`);
    return response.data;
  },

  addReview: async (productId, reviewData) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.PRODUCTS}/api/products/${productId}/reviews`,
      reviewData
    );
    return response.data;
  }
};

