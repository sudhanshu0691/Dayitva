// ============================================================
// API Configuration
// Axios instance with interceptors for API calls
// ============================================================

import axios, { AxiosInstance, AxiosError } from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

let refreshPromise: Promise<string> | null = null;

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to detect if this is an auditor API call
function isAuditorRequest(config: any): boolean {
  return config?.url?.startsWith("/auditor/") || false;
}

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const isAuditor = isAuditorRequest(config);
      const tokenKey = isAuditor ? "auditorToken" : "authToken";
      const token = localStorage.getItem(tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any;
    const isAuditor = isAuditorRequest(originalRequest);

    if (originalRequest?.url?.includes("/refresh")) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== "undefined") {
          if (!refreshPromise) {
            const refreshTokenKey = isAuditor ? "auditorRefreshToken" : "refreshToken";
            const authTokenKey = isAuditor ? "auditorToken" : "authToken";
            const refreshEndpoint = isAuditor ? "/auditor/refresh" : "/auth/refresh";
            const redirectUrl = isAuditor ? "/auditor/login" : "/login";

            const currentRefreshToken = localStorage.getItem(refreshTokenKey);
            if (!currentRefreshToken) {
              throw new Error("No refresh token available");
            }

            refreshPromise = axios
              .post(`${API_BASE_URL}${refreshEndpoint}`, {
                refreshToken: currentRefreshToken,
              })
              .then((response) => {
                const { accessToken, token, refreshToken: newRefreshToken } = response.data.data;
                const refreshedToken = accessToken || token;
                if (!refreshedToken) {
                  throw new Error("Refresh response did not include an access token");
                }

                localStorage.setItem(authTokenKey, refreshedToken);
                if (newRefreshToken) {
                  localStorage.setItem(refreshTokenKey, newRefreshToken);
                }

                return refreshedToken;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }

          const refreshedToken = await refreshPromise;

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        if (typeof window !== "undefined") {
          const refreshTokenKey = isAuditor ? "auditorRefreshToken" : "refreshToken";
          const authTokenKey = isAuditor ? "auditorToken" : "authToken";
          const redirectUrl = isAuditor ? "/auditor/login" : "/login";

          localStorage.removeItem(authTokenKey);
          localStorage.removeItem(refreshTokenKey);
          localStorage.removeItem("user");
          localStorage.removeItem("auditor");
          window.location.href = redirectUrl;
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message =
      error.response?.data?.message ||
      error.response?.statusText ||
      "An error occurred";

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
