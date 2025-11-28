import { useEffect } from "react";
import { useBackendStatus } from "../context/BackendStatusContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { FiServer, FiWifiOff, FiRefreshCw, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const BackendOffline = () => {
  const { checkBackendStatus, isChecking } = useBackendStatus();

  useEffect(() => {
    // Auto-retry checking backend status every 5 seconds
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <FiServer className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <FiWifiOff className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">
                Backend Service Unavailable
              </CardTitle>
              <CardDescription className="text-base">
                Unable to connect to the server. Please check your connection and try again.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-3 py-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isChecking
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isChecking
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground"
                    }`}
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isChecking
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground"
                    }`}
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {isChecking
                    ? "Checking connection..."
                    : "Waiting for service to resume..."}
                </span>
              </div>
            </div>

            {/* Troubleshooting steps */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FiAlertCircle className="h-4 w-4 text-primary" />
                <span>Troubleshooting Steps</span>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Verify that the backend server is running and accessible
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Check that the server is listening on the correct port
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    Ensure your network connection is stable
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiRefreshCw className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    This page will automatically refresh when the service is restored
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackendOffline;

