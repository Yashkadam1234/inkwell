// src/lib/api.js — Axios instance + typed API calls
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  timeout: 30000,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("inkwell_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("inkwell_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (name, email, password) => api.post("/auth/signup", { name, email, password }),
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
};

// ── Notes ─────────────────────────────────────────────────────────────────────
export const notesApi = {
  list: (params = {}) => api.get("/notes", { params }),
  create: (data) => api.post("/notes", data),
  update: (id, data) => api.patch(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  getShared: (shareId) => api.get(`/notes/shared/${shareId}`),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiApi = {
  generate: (noteId) => api.post(`/ai/generate/${noteId}`),
  stats: () => api.get("/ai/stats"),
};

// ── Insights ──────────────────────────────────────────────────────────────────
export const insightsApi = {
  get: () => api.get("/insights"),
};

export default api;
