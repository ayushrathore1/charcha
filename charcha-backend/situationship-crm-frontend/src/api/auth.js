import api from "./config";

export const authApi = {
  login: async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      return res.data;
    } catch (e) {
      return e.response?.data || { success: false, message: "Login failed" };
    }
  },
  register: async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password, platform: "MEDHA" });
      return res.data;
    } catch (e) {
      return e.response?.data || { success: false, message: "Registration failed" };
    }
  },
};
