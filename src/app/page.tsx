import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Welcome text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Welcome to FlyNext
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find the best flights and hotels, all in one place.
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/flight-search"
              className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-center"
            >
              Search Flights
            </Link>
            <Link
              href="/hotel-search"
              className="px-6 py-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-center"
            >
              Search Hotels
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
