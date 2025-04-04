'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHotel, FaBed, FaBookmark } from 'react-icons/fa';
import AuthWrapper from '@/app/components/AuthWrapper';

interface HotelSummary {
  id: string;
  name: string;
  city: string;
  address: string;
  starRating: number;
  logoPath: string | null; // Changed from logo to logoPath
  totalRooms: number;
  activeBookings: number;
}

export default function HotelManagePage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/users/login?redirect=/hotel-manage');
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    async function fetchHotels() {
      try {
        const response = await fetch('/api/hotel/manage', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch hotels');
        }

        setHotels(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [token]);

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-700 dark:text-gray-300">Loading hotels...</div>
        </div>
      </AuthWrapper>
    );
  }

  if (error) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Return to home
            </Link>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  const sortedHotels = [...hotels].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AuthWrapper>
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
              {sortedHotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  href={`/hotel-manage/${hotel.id}`}
                  className="block group h-full"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden 
                    group-hover:shadow-xl transition-all duration-200 border-2 border-transparent 
                    group-hover:border-blue-500 h-full flex flex-col">
                    {/* Hotel Image/Logo */}
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 relative flex-shrink-0">
                      {hotel.logoPath ? (
                        <img
                          src={`/api/images${hotel.logoPath}`}
                          alt={`${hotel.name} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center">
                                <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M19 19V4h-4V3H5v16H3v2h12V6h2v15h4v-2h-2z"/>
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaHotel className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Hotel Info */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {hotel.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {hotel.city}
                      </p>

                      {/* Push stats to bottom */}
                      <div className="mt-auto">
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
    </AuthWrapper>
  );
}