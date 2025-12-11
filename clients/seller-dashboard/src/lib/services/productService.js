import apiClient, { API_ENDPOINTS } from '../config/api';

export const productService = {
  // Get seller's products
  getMyProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_ENDPOINTS.PRODUCTS}/api/products/seller/my-products?${queryString}`
    );
    return response.data;
  },

  // Create product with base64 images
  createProduct: async (productData) => {
    const response = await apiClient.post(
      `${API_ENDPOINTS.PRODUCTS}/api/products`,
      productData
    );
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(
      `${API_ENDPOINTS.PRODUCTS}/api/products/${id}`,
      productData
    );
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.PRODUCTS}/api/products/${id}`
    );
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/api/products/categories`);
    return response.data;
  }
};
