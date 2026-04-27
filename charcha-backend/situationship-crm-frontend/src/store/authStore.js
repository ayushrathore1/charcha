import { create } from "zustand";
import api from "../api/config";
import { authApi } from "../api/auth";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("crm_token"),
  isAuthenticated: !!localStorage.getItem("crm_token"),

  login: async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.success) {
      localStorage.setItem("crm_token", data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
      return { success: true };
    }
    return { success: false, message: data.message };
  },

  register: async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    if (data.success) {
      localStorage.setItem("crm_token", data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true });
      return { success: true };
    }
    return { success: false, message: data.message };
  },

  logout: () => {
    localStorage.removeItem("crm_token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("crm_token");
    if (!token) return false;
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        set({ user: res.data.user, isAuthenticated: true });
        return true;
      }
    } catch {
      localStorage.removeItem("crm_token");
      set({ user: null, token: null, isAuthenticated: false });
    }
    return false;
  },
}));
