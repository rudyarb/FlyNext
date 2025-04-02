'use client';

import HotelSearch from '@/app/components/HotelSearch';

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
    </main>
  );
}