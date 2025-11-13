import { create } from 'zustand';
import { authService } from '../services/authService';

export const useStore = create((set, get) => ({
  // Auth state
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
    set({ user: null, isAuthenticated: false, cart: [] });
  },

  // Cart state
  cart: [],
  
  initCart: () => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      set({ cart });
    }
  },
  
  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.cart.find(item => item._id === product._id);
      let newCart;
      
      if (existingItem) {
        newCart = state.cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...state.cart, { ...product, quantity }];
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      return { cart: newCart };
    });
  },

  removeFromCart: (productId) => {
    set((state) => {
      const newCart = state.cart.filter(item => item._id !== productId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      return { cart: newCart };
    });
  },

  updateCartQuantity: (productId, quantity) => {
    set((state) => {
      const newCart = state.cart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newCart));
      }
      return { cart: newCart };
    });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
    set({ cart: [] });
  },

  getCartTotal: () => {
    const state = get();
    return state.cart.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  },

  getCartItemsCount: () => {
    const state = get();
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  }
}));

