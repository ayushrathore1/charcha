import api from "./config";

export const situationshipApi = {
  create: async (data) => {
    const res = await api.post("/situationships", data);
    return res.data;
  },
  getAll: async (status, sort) => {
    let url = "/situationships";
    const params = new URLSearchParams();
    if(status) params.append("status", status);
    if(sort) params.append("sort", sort);
    if(params.toString()) url += `?${params.toString()}`;
    const res = await api.get(url);
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get("/situationships/dashboard");
    return res.data;
  },
  getOne: async (id) => {
    const res = await api.get(`/situationships/${id}`);
    return res.data;
  },
  logInteraction: async (id, data) => {
    const res = await api.post(`/situationships/${id}/interactions`, data);
    return res.data;
  },
  generateNudge: async (id) => {
    const res = await api.post(`/situationships/${id}/nudge`);
    return res.data;
  }
};

export const nudgeApi = {
  getPending: async () => {
    const res = await api.get("/nudges/pending");
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.post(`/nudges/${id}/status`, { status });
    return res.data;
  }
};
