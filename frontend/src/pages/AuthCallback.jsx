import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios, { clearCsrfToken, getCsrfToken } from "../utils/api.js"; // Use API utility with CSRF support
import logger from "../utils/logger.js";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasExchanged = useRef(false); // Prevent double execution in StrictMode

  useEffect(() => {
    // Prevent double execution
    if (hasExchanged.current) {
      return;
    }

    const code = searchParams.get("code");
    const token = searchParams.get("token"); // Fallback for backward compatibility

    // Handle code exchange for token (new secure method)
    if (code) {
      hasExchanged.current = true; // Mark as attempted

      const exchangeCode = async () => {
        try {
          logger.debug("Exchanging code for token", {
            codeLength: code.length,
          });
          const response = await axios.post(
            "/api/auth/exchange-code",
            { code },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true, // Include cookies for session if needed
            }
          );
          const token = response.data.token;
          if (token) {
            // Clear old CSRF token before login (new session will be created)
            clearCsrfToken();
            await login(token);
            // Wait for session to be established, then get new CSRF token
            await new Promise((resolve) => setTimeout(resolve, 200));
            await getCsrfToken(true);
            navigate("/dashboard");
          } else {
            logger.error("No token in response");
            navigate("/login?error=invalid_code");
          }
        } catch (error) {
          // Don't navigate on 400 if code was already used (likely double execution)
          if (
            error.response?.status === 400 &&
            error.response?.data?.message?.includes("Invalid or expired")
          ) {
            // Code was already used, likely from StrictMode double execution
            // Check if we're already logged in
            const token = localStorage.getItem("token");
            if (token) {
              // Already logged in, just navigate to dashboard
              navigate("/dashboard");
              return;
            }
          }

          logger.error("Error exchanging code", error);
          const errorMessage =
            error.response?.data?.message || "Authentication failed";
          navigate(`/login?error=${encodeURIComponent(errorMessage)}`);
        }
      };
      exchangeCode();
      return;
    }

    // Fallback for direct token (backward compatibility)
    if (token) {
      hasExchanged.current = true;
      login(token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default AuthCallback;
