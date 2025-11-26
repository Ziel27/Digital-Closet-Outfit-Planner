import { createContext, useContext, useState, useEffect } from "react";
import axios, { clearCsrfToken, getCsrfToken } from "../utils/api.js"; // Use API utility with CSRF support
import logger from "../utils/logger.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/users/profile");
      setUser(response.data);
    } catch (error) {
      logger.error("Error fetching user", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // Clear old CSRF token and get a new one for the new session
    clearCsrfToken();
    // Wait a bit for session to be established, then fetch new CSRF token
    setTimeout(async () => {
      await getCsrfToken(true);
    }, 100);
    fetchUser();
  };

  const logout = async () => {
    try {
      // Try to get a fresh CSRF token before logout
      // If this fails (e.g., session expired), we'll still proceed with local logout
      try {
        await getCsrfToken(true);
      } catch (csrfError) {
        // CSRF token fetch failed, but we'll still try to logout
        logger.warn(
          "Could not refresh CSRF token before logout, proceeding anyway"
        );
      }

      // Attempt logout with CSRF token
      // The axios interceptor will automatically retry once if CSRF fails
      await axios.post("/api/auth/logout");
    } catch (error) {
      // Even if logout fails on server (CSRF error, network error, etc.),
      // we still clear local state to log the user out
      // This is safe because the server-side session will expire anyway
      if (
        error.response?.status !== 403 ||
        !error.response?.data?.message?.includes("CSRF")
      ) {
        // Only log non-CSRF errors to avoid noise
        logger.error("Error logging out", error);
      }
    } finally {
      // Always clear local state regardless of server response
      // This ensures user is logged out even if server request fails
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      clearCsrfToken(); // Clear CSRF token on logout
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    fetchUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
