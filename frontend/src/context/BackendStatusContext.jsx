import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "../utils/api.js";

const BackendStatusContext = createContext();

export const useBackendStatus = () => {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error("useBackendStatus must be used within a BackendStatusProvider");
  }
  return context;
};

export const BackendStatusProvider = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const statusRef = useRef(isBackendOnline);

  // Keep ref in sync with state
  useEffect(() => {
    statusRef.current = isBackendOnline;
  }, [isBackendOnline]);

  const checkBackendStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      // Try a lightweight endpoint to check backend status
      await axios.get("/api/csrf-token", {
        timeout: 3000,
        validateStatus: (status) => status < 500, // Accept any status < 500 as "backend is up"
      });
      setIsBackendOnline(true);
    } catch (error) {
      // Check if it's a connection error (backend not running)
      if (
        error.code === "ECONNREFUSED" ||
        error.code === "ERR_NETWORK" ||
        error.code === "ETIMEDOUT" ||
        error.message?.includes("Network Error")
      ) {
        setIsBackendOnline(false);
      } else {
        // Other errors (like 500) mean backend is running but has issues
        setIsBackendOnline(true);
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Check backend status on mount
    checkBackendStatus();

    // Set up axios interceptor to detect backend connection errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // If we get a successful response, backend is online
        if (!statusRef.current) {
          setIsBackendOnline(true);
        }
        return response;
      },
      (error) => {
        // Check if it's a connection error
        if (
          error.code === "ECONNREFUSED" ||
          error.code === "ERR_NETWORK" ||
          error.code === "ETIMEDOUT" ||
          error.message?.includes("Network Error")
        ) {
          setIsBackendOnline(false);
        }
        return Promise.reject(error);
      }
    );

    // Periodically check backend status (every 10 seconds)
    const interval = setInterval(checkBackendStatus, 10000);

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
      clearInterval(interval);
    };
  }, [checkBackendStatus]);

  const value = {
    isBackendOnline,
    isChecking,
    checkBackendStatus,
  };

  return (
    <BackendStatusContext.Provider value={value}>
      {children}
    </BackendStatusContext.Provider>
  );
};

