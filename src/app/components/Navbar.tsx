"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";
import DarkModeToggle from "./DarkModeToggle";
import { FaUserCircle } from "react-icons/fa";

const Navbar: React.FC = () => {
  const { isAuthenticated, userName, logout, userRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when authentication status changes (fix for logout issue)
  useEffect(() => {
    setDropdownOpen(false);
  }, [isAuthenticated]);

  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-4">
          <Logo />

          <div className="flex items-center space-x-2">
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

        <div className="flex items-center space-x-4 relative">
          <DarkModeToggle />
          {isAuthenticated ? (
            <>
              <span className="text-gray-600 dark:text-gray-300">Welcome, {userName}</span>

              {/* Profile Icon with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="text-gray-600 dark:text-gray-300 text-2xl focus:outline-none"
                >
                  <FaUserCircle />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-md rounded-lg">
                    <Link
                      href="/users/edit-profile"
                      className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    {userRole === "ADMIN" && (
                      <Link
                        href="/hotel-manage"
                        className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Manage Hotels
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
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
      </div>
    </nav>
  );
};

export default Navbar;
