import React, { createContext, useState, useEffect, useCallback } from "react";
import api, { setAuthToken } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("agro_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("agro_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      if (res.data && res.data.token) {
        const { token, user } = res.data;
        localStorage.setItem("agro_token", token);
        localStorage.setItem("agro_user", JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { ok: true, user };
      }
      return { ok: false, message: res.data?.message || "Login failed" };
    } catch (error) {
      return { 
        ok: false, 
        message: error.response?.data || error.message || "Login failed" 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post("/api/auth/register", userData);
      if (res.data && res.data.token) {
        const { token, user } = res.data;
        localStorage.setItem("agro_token", token);
        localStorage.setItem("agro_user", JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { ok: true, user };
      }
      return { ok: false, message: res.data?.message || "Registration failed" };
    } catch (error) {
      return { 
        ok: false, 
        message: error.response?.data || error.message || "Registration failed" 
      };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("agro_token");
    localStorage.removeItem("agro_user");
    setToken(null);
    setUser(null);
    setAuthToken(null);
    window.location.href = "/login";
  }, []);

  const updateProfile = async (updates) => {
    try {
      const res = await api.put("/api/users/" + user.id, updates);
      if (res.data) {
        const updatedUser = { ...user, ...res.data.user };
        localStorage.setItem("agro_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { ok: true, user: updatedUser };
      }
    } catch (error) {
      return { ok: false, message: error.response?.data || error.message };
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;