import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

export const useOrderStore = create((set) => ({
  activeOrder: null,
  orderHistory: [],
  setActiveOrder: (order) => set({ activeOrder: order }),
  setOrderHistory: (orders) => set({ orderHistory: orders }),
}));

export const useWalletStore = create((set) => ({
  coinBalance: 0,
  setCoinBalance: (coinBalance) => set({ coinBalance }),
}));
