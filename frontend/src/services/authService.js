// frontend/src/services/authService.js
import api from "./axios";

/** POST /auth/login/ → { access, refresh, user } */
export async function login({ username, password }) {
  const res = await api.post("/auth/login/", { username, password });
  return res.data; // { access, refresh, user }
}

/** POST /auth/register/ → 201 { username, email, ... } */
export async function register(payload) {
  // payload: { username, email?, password, first_name?, last_name?, role? }
  const res = await api.post("/auth/register/", payload);
  return res.data;
}

/** POST /auth/refresh/ → { access } */
export async function refresh(refreshToken) {
  const res = await api.post("/auth/refresh/", { refresh: refreshToken });
  return res.data; // { access: "..." }
}

/** GET /auth/me/ → { id, username, email, first_name, last_name, role } */
export async function me() {
  const res = await api.get("/auth/me/");
  return res.data;
}
