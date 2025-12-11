import { create } from 'zustand';
import { authService } from '../services/authService';

export const useStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  initAuth: () => {
    if (typeof window !== 'undefined') {
      const user = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();
      set({ user, isAuthenticated });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
  
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  }
}));

