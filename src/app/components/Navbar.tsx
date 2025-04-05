"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";
import DarkModeToggle from "./DarkModeToggle";
import { FaUserCircle, FaBars, FaTimes, FaBell, FaShoppingCart } from "react-icons/fa";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const { isAuthenticated, userName, logout, role } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Set token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !token) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort notifications by createdAt in descending order
        const sortedNotifications = data.notifications.sort(
          (a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotifications(sortedNotifications);

        // Calculate unread count
        const unread = sortedNotifications.filter((notif: Notification) => !notif.read).length;
        setUnreadCount(unread);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        console.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const unreadNotifications = notifications.filter((notif) => !notif.read);

      for (const notif of unreadNotifications) {
        await markAsRead(notif.id);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Clear notifications and logout
  const handleLogout = () => {
    // Clear notifications and unread count
    setNotifications([]);
    setUnreadCount(0);

    // Clear token from state and localStorage
    setToken(null);
    localStorage.removeItem("token");

    // Call the logout function from the auth context
    logout();
  };

  // Fetch notifications on initial load and when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, token]); // Add token as a dependency

  // Poll for notifications every 20 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, token]); // Add token as a dependency

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-4">
          <Logo />

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/flight-search" className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              Search Flights
            </Link>
            <Link href="/hotel-search" className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              Search Hotels
            </Link>
            <Link href="/bookings" className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              My Bookings
            </Link>
          </div>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4 relative">
          <DarkModeToggle />

          {/* Cart Icon */}
          <Link href="/bookings/checkout" className="text-gray-600 dark:text-gray-300 text-2xl focus:outline-none" aria-label="Cart">
            <FaShoppingCart />
          </Link>

          {isAuthenticated && (
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => setNotificationDropdownOpen((prev) => !prev)}
                className="text-gray-600 dark:text-gray-300 text-2xl focus:outline-none relative"
                aria-label="Notifications"
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden z-50">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer ${
                            !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <>
              <span className="text-gray-600 dark:text-gray-300">Welcome, {userName}</span>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="text-gray-600 dark:text-gray-300 text-2xl focus:outline-none"
                >
                  <FaUserCircle />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden z-50">
                    <Link
                      href="/users/edit-profile"
                      className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    {role === "ADMIN" && (
                      <Link
                        href="/hotel-manage"
                        className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Manage Hotels
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 border-t border-gray-200 dark:border-gray-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/users/login" className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                Login
              </Link>
              <Link href="/users/signup" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                Register
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center space-x-2">
          <DarkModeToggle />

          {/* Mobile Cart Icon */}
          <Link href="/bookings/checkout" className="p-2 text-gray-600 dark:text-gray-300" aria-label="Cart">
            <FaShoppingCart />
          </Link>

          {isAuthenticated && (
            <button
              className="relative p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setNotificationDropdownOpen((prev) => !prev)}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            className="mobile-menu-button p-2 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;