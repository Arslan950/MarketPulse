import { create } from 'zustand';
import axios from 'axios';

const ACCESS_TOKEN_STORAGE_KEY = 'marketpulse-access-token';

export const useAuthStore = create((set, get) => ({
  user: null,
  business: null,
  isLoading: true,
  error: null,

  fetchProfile: async () => {
    if (get().user && get().business) return;

    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const config = {
      withCredentials: true,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    };

    set({ isLoading: true, error: null });

    try {
      const [userRes, businessRes] = await Promise.allSettled([
        axios.get('http://localhost:3000/api/v1/auth/current-user', config),
        axios.get('http://localhost:3000/api/v1/business/get-info', config)
      ]);

      let userData = null;
      let businessData = null;

      if (userRes.status === 'fulfilled' && userRes.value.data?.data) {
        userData = userRes.value.data.data.data || userRes.value.data.data;
      } else {
        throw new Error('Authentication failed');
      }

      if (businessRes.status === 'fulfilled' && businessRes.value.data?.data?.business) {
        businessData = businessRes.value.data.data.business;
      }

      set({ user: userData, business: businessData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, user: null, business: null });
    }
  },

  updateBusinessInStore: (newBusinessData) => {
    set((state) => ({
      business: {
        ...(state.business || {}),
        ...newBusinessData,
      },
    }));
  },

  clearProfile: () => {
    set({ user: null, business: null, isLoading: false, error: null });
  },
}));
