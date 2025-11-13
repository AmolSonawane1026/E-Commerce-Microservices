import apiClient, { API_ENDPOINTS } from '../config/api';

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post(`${API_ENDPOINTS.AUTH}/api/auth/register`, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post(`${API_ENDPOINTS.AUTH}/api/auth/login`, credentials);
    if (response.data.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
  },

  getProfile: async () => {
    const response = await apiClient.get(`${API_ENDPOINTS.AUTH}/api/auth/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put(`${API_ENDPOINTS.AUTH}/api/auth/profile`, profileData);
    return response.data;
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
};

