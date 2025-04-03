'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHotel, FaBed, FaBookmark } from 'react-icons/fa';

interface HotelSummary {
  id: string;
  name: string;
  city: string;
  address: string;
  starRating: number;
  logo: string | null;
  totalRooms: number;
  activeBookings: number;
}

export default function HotelManagePage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchHotels() {
      try {
        const token = localStorage.getItem('token');
        const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
        
        if (!token || !payload) {
          router.push('/users/login?redirect=/hotel-manage');
          return;
        }

        const response = await fetch('/api/hotel/manage', {
          headers: {
            'x-user': payload.id, // Send just the ID, not a stringified object
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            setError('Access denied. Only hotel owners can access this page.');
            return;
          }
          if (response.status === 401) {
            router.push('/users/login?redirect=/hotel-manage');
            return;
          }
          throw new Error(data.error || 'Failed to fetch hotels');
        }
        
        setHotels(data);
      } catch (error) {
        setError('Failed to load hotels');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300">Loading hotels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hotel Management
            </h1>
            <Link
              href="/hotel-manage/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                transition-colors shadow-md"
            >
              Add New Hotel
            </Link>
          </div>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Link
                key={hotel.id}
                href={`/hotel-manage/${hotel.id}`}
                className="block group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden 
                  group-hover:shadow-xl transition-all duration-200 border-2 border-transparent 
                  group-hover:border-blue-500">
                  {/* Hotel Image/Logo */}
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                    {hotel.logo ? (
                      <img
                        src={hotel.logo}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHotel className="text-4xl text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Hotel Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {hotel.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {hotel.city}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaBed />
                        <span>{hotel.totalRooms} Rooms</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FaBookmark />
                        <span>{hotel.activeBookings} Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {hotels.length === 0 && (
            <div className="text-center py-12">
              <FaHotel className="mx-auto text-5xl text-gray-400 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Hotels Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by adding your first hotel property
              </p>
              <Link
                href="/hotel-manage/new"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors shadow-md"
              >
                Add New Hotel
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}