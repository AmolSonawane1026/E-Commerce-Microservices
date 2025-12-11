import apiClient, { API_ENDPOINTS } from '../config/api';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post(`${API_ENDPOINTS.AUTH}/api/auth/login`, credentials);
    if (response.data.success && response.data.data.user.role === 'seller') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('seller_token', response.data.data.token);
        localStorage.setItem('seller_user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post(`${API_ENDPOINTS.AUTH}/api/auth/register`, {
      ...userData,
      role: 'seller'
    });
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seller_token');
      localStorage.removeItem('seller_user');
      window.location.href = '/auth/login';
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('seller_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('seller_token');
    }
    return false;
  }
};
