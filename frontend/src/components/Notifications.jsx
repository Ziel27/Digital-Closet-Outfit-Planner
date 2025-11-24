import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "../utils/api.js";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FiBell, FiCalendar, FiX, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const Notifications = ({ showToast, mobile = false, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    let intervalId = null;
    const retryDelayRef = { current: 5 * 60 * 1000 }; // Start with 5 minutes, use ref to allow updates

    const fetchNotifications = async (signal = null) => {
      try {
        const response = await axios.get("/api/notifications", { signal });
        const newNotifications = response.data.notifications || [];
        setNotifications(newNotifications);
        // Reset to normal interval on success
        retryDelayRef.current = 5 * 60 * 1000;
      } catch (error) {
        // Don't log errors for aborted requests or rate limits
        if (error.name !== "CanceledError" && error.code !== "ERR_CANCELED") {
          if (error.response?.status === 429) {
            // Rate limit exceeded - increase retry delay exponentially
            retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30 * 60 * 1000); // Max 30 minutes
            console.warn(`Rate limit exceeded for notifications. Will retry in ${retryDelayRef.current / 1000 / 60} minutes.`);
            // Don't update state on rate limit - keep existing notifications
          } else {
            console.error("Error fetching notifications:", error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    const loadNotifications = async () => {
      if (isMounted) {
        await fetchNotifications(abortController.signal);
      }
    };

    const scheduleNextFetch = () => {
      if (intervalId) {
        clearTimeout(intervalId);
      }
      
      intervalId = setTimeout(() => {
        if (isMounted) {
          abortController.abort(); // Cancel previous request
          abortController = new AbortController();
          fetchNotifications(abortController.signal).then(() => {
            scheduleNextFetch();
          }).catch(() => {
            // Even on error, schedule next fetch (with potentially increased delay)
            scheduleNextFetch();
          });
        }
      }, retryDelayRef.current);
    };

    loadNotifications();
    scheduleNextFetch();

    return () => {
      isMounted = false;
      abortController.abort();
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="w-full">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        className="w-full justify-start h-10 px-4"
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const newIsOpen = !isOpen;
          setIsOpen(newIsOpen);

          // Mark all notifications as read when opening the dropdown
          if (newIsOpen && notifications.length > 0) {
            try {
              await axios.post("/api/notifications/mark-all-read");
              // Refresh notifications immediately to update the count
              const response = await axios.get("/api/notifications");
              setNotifications(response.data.notifications || []);
            } catch (error) {
              console.error("Error marking notifications as read:", error);
            }
          }
        }}
        type="button"
      >
        <FiBell className="h-4 w-4 mr-3 flex-shrink-0" />
        <span className="flex-1 text-left">Notifications</span>
        {!loading && unreadCount > 0 && (
          <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto flex-shrink-0 min-w-[1.25rem]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Notifications Dropdown - Using Portal to render outside sidebar */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100] bg-black/20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                if (onClose) onClose();
              }}
            />
            <Card
              className={`fixed ${
                mobile ? "left-4 right-4" : "left-64 right-4"
              } top-20 w-80 lg:w-96 max-h-[500px] overflow-y-auto z-[101] shadow-lg border bg-card`}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                      if (onClose) onClose();
                    }}
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                </div>
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      to="/calendar"
                      onClick={() => {
                        setIsOpen(false);
                        if (onClose) onClose();
                      }}
                      className="block p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          <FiCalendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.location && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Location: {notification.location}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <FiChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <FiBell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>,
          document.body
        )}
    </div>
  );
};

export default Notifications;
