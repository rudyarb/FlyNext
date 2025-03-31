import React from 'react';
import Link from 'next/link';
import Logo from './Logo';
import DarkModeToggle from './DarkModeToggle';

interface NavbarProps {
  userLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  userLoggedIn = false,
  userName = '',
  onLogout
}) => {
  return (
    <nav className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-4">
          <Logo />
          
          <div className="flex items-center space-x-2">
            <Link
              href="/flight-search"
              className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Search Flights
            </Link>
            
            <Link
              href="/hotel-search"
              className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Search Hotels
            </Link>
            
            <Link 
              href="/bookings" 
              className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              My Bookings
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DarkModeToggle />
          {userLoggedIn ? (
            <>
              <span className="text-gray-600 dark:text-gray-300">Welcome, {userName}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
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