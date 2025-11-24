import axios from "axios";

// Set base URL for all API requests
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";
axios.defaults.baseURL = API_BASE_URL;

// Configure axios defaults
axios.defaults.withCredentials = true; // Include cookies in all requests

let csrfToken = null;

// Clear CSRF token cache (useful after login/logout)
export const clearCsrfToken = () => {
  csrfToken = null;
};

// Get CSRF token from server
export const getCsrfToken = async (forceRefresh = false) => {
  if (!csrfToken || forceRefresh) {
    try {
      // Use relative path - Vite proxy will handle it
      const response = await axios.get("/api/csrf-token", {
        withCredentials: true, // Include cookies for session
      });
      csrfToken = response.data.csrfToken;
    } catch (error) {
      // Silently fail - CSRF might not be critical for some requests
      if (error.code !== "ECONNREFUSED" && error.code !== "ERR_NETWORK") {
        console.error("Failed to get CSRF token:", error);
      }
      csrfToken = null;
    }
  }
  return csrfToken;
};

// Axios interceptor to add CSRF token and auth token to requests
axios.interceptors.request.use(
  async (config) => {
    // Add Authorization token from localStorage if available
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Skip CSRF for GET requests and public endpoints
    if (
      config.method !== "get" &&
      config.method !== "head" &&
      config.method !== "options" &&
      !config.url?.includes("/public") &&
      !config.url?.includes("/auth/google") &&
      !config.url?.includes("/auth/exchange-code") &&
      !config.url?.includes("/csrf-token")
    ) {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        // Ensure headers object exists
        if (!config.headers) {
          config.headers = {};
        }
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle CSRF errors and rate limiting
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle CSRF errors
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.includes("CSRF") &&
      !originalRequest._retry
    ) {
      // Clear token and retry once
      clearCsrfToken();
      originalRequest._retry = true;
      console.warn("CSRF token expired, refreshing...");
      
      // Get new CSRF token (force refresh)
      const newToken = await getCsrfToken(true);
      if (newToken) {
        // Ensure headers object exists
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers["X-CSRF-Token"] = newToken;
        // Retry the original request
        return axios(originalRequest);
      } else {
        console.error("Failed to get new CSRF token for retry");
      }
    }
    
    // Handle rate limiting (429) - don't retry automatically, let components handle it
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60; // Default to 60 seconds
      console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
      // Don't retry automatically for rate limits - components should handle this
    }
    
    return Promise.reject(error);
  }
);

export default axios;
