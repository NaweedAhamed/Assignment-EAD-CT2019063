// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import * as authApi from "../services/authService";

const AuthContext = createContext(null);

const STORAGE_KEY = "auth_v1"; // access/refresh/user

function setAuthHeader(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from storage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setUser(saved.user || null);
        setAccess(saved.access || null);
        setRefresh(saved.refresh || null);
        setAuthHeader(saved.access || null);
      }
    } catch {}
    setLoading(false);
  }, []);

  // Persist to storage when tokens/user change
  useEffect(() => {
    const payload = JSON.stringify({ user, access, refresh });
    localStorage.setItem(STORAGE_KEY, payload);
    setAuthHeader(access);
  }, [user, access, refresh]);

  // Axios interceptor for 401 → refresh flow
  useEffect(() => {
    const respInterceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error?.config;
        const status = error?.response?.status;

        if (status === 401 && refresh && !original?._retry) {
          original._retry = true;
          try {
            const data = await authApi.refresh(refresh);
            setAccess(data.access);
            // Update header for the retried request
            original.headers = original.headers || {};
            original.headers["Authorization"] = `Bearer ${data.access}`;
            return api(original);
          } catch (e) {
            // refresh failed → logout
            doLogout(false);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(respInterceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  async function doLogin({ username, password }) {
    const data = await authApi.login({ username, password });
    setAccess(data.access);
    setRefresh(data.refresh);
    setUser(data.user || null);
    return data.user;
  }

  async function doRegister(payload) {
    const res = await authApi.register(payload);
    return res;
  }

  function doLogout(redirect = true) {
    setUser(null);
    setAccess(null);
    setRefresh(null);
    setAuthHeader(null);
    localStorage.removeItem(STORAGE_KEY);
    if (redirect) navigate("/login", { replace: true });
  }

  const value = useMemo(
    () => ({
      user,
      accessToken: access,
      refreshToken: refresh,
      loading,
      login: doLogin,
      logout: doLogout,
      register: doRegister,
      setUser,
    }),
    [user, access, refresh, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
