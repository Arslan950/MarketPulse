import { create } from 'zustand'

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

const getInitialStatus = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  return !!token;
};

export const useLoggedInStatus = create((set) => ({
  isLoggedIn: getInitialStatus(),

  setStatus: (status) => {
    set({ isLoggedIn: status });
  },

  changeStatus: () => {
    set((state) => {
      const nextStatus = !state.isLoggedIn;
      localStorage.setItem("isLoggedIn", nextStatus.toString());
      return { isLoggedIn: nextStatus };
    });
  }
}));