import axios from "axios";

const baseURL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8000/api";

const api = axios.create({ baseURL });

export default api;
