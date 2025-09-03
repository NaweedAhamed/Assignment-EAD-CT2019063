// frontend/src/services/axios.js
import axios from "axios";

const baseURL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// --- Auth header helpers (shared with AuthContext) ---
const STORAGE_KEY = "auth_v1";

export function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

function bootstrapAuthHeaderFromStorage() {
  try {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const access = parsed?.access;
    if (access) setAuthHeader(access);
  } catch {
    // ignore parse errors
  }
}

bootstrapAuthHeaderFromStorage();

// Ensure Authorization is present on every request if available
api.interceptors.request.use((config) => {
  if (!config.headers?.Authorization) {
    const token = api.defaults.headers.common["Authorization"];
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = token;
    }
  }
  return config;
});

export default api;
