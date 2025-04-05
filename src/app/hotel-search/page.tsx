'use client';

import HotelSearch from '@/app/components/HotelSearch';
import Cart from '@/app/components/Cart';
import Link from 'next/link'; // Import Link for navigation

export default function HotelSearchPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Page heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-200">
              Search through thousands of hotels worldwide
            </p>
          </div>

          {/* Hotel search component */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <HotelSearch />
          </div>
        </div>
      </div>
      <Cart />

      {/* Proceed to Checkout Link */}
      <div className="text-center mt-8">
        <Link
          href="/bookings/checkout"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </main>
  );
}