import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "../utils/api.js";
import logger from "../utils/logger.js";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FiBell, FiCalendar, FiX, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const Notifications = ({ showToast, mobile = false, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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
            retryDelayRef.current = Math.min(
              retryDelayRef.current * 2,
              30 * 60 * 1000
            ); // Max 30 minutes
            logger.warn(
              `Rate limit exceeded for notifications. Will retry in ${
                retryDelayRef.current / 1000 / 60
              } minutes.`
            );
            // Don't update state on rate limit - keep existing notifications
          } else {
            logger.error("Error fetching notifications", error);
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
          fetchNotifications(abortController.signal)
            .then(() => {
              scheduleNextFetch();
            })
            .catch(() => {
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
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 384; // w-96 = 384px
      const viewportWidth = window.innerWidth;

      // Position to the right of the sidebar (sidebar is typically 256px = w-64)
      // Or align with button if there's enough space
      let left = rect.left;

      // If dropdown would go off screen, position it to the right of the sidebar
      if (rect.left + dropdownWidth > viewportWidth - 16) {
        // Position it to the right of the sidebar (assuming sidebar is ~256px wide)
        left = Math.max(256 + 16, viewportWidth - dropdownWidth - 16);
      }

      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap below button
        left: left,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <>
      <div className="w-full relative" ref={containerRef}>
        {/* Notification Bell */}
        <Button
          ref={buttonRef}
          variant="ghost"
          className="w-full justify-start h-10 px-4 relative"
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
                logger.error("Error marking notifications as read", error);
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
      </div>

      {/* Compact Dropdown - Using Portal to escape sidebar overflow */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop for mobile */}
            {mobile && (
              <div
                className="fixed inset-0 z-[99] bg-black/10"
                onClick={() => setIsOpen(false)}
              />
            )}
            <Card
              className="fixed w-80 lg:w-96 max-h-[400px] overflow-hidden z-[100] shadow-xl border bg-card"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                // Ensure it doesn't go off screen
                maxWidth: `calc(100vw - ${dropdownPosition.left + 16}px)`,
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    <FiX className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to="/calendar"
                          onClick={() => {
                            setIsOpen(false);
                            if (onClose) onClose();
                          }}
                          className="block p-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0 mt-0.5">
                              <FiCalendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-tight">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.location && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📍 {notification.location}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {new Date(notification.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <FiBell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No notifications</p>
                      <p className="text-xs mt-1 opacity-70">
                        You're all caught up!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>,
          document.body
        )}
    </>
  );
};

export default Notifications;
