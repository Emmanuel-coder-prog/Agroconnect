import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Add request/response interceptors for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      localStorage.removeItem("agro_token");
      localStorage.removeItem("agro_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export default api;