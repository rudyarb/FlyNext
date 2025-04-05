'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHotel, FaBed, FaBookmark, FaStar } from 'react-icons/fa';
import AuthWrapper from '@/app/components/AuthWrapper';

interface HotelSummary {
  id: string;
  name: string;
  city: string;
  address: string;
  starRating: number;
  logoUrl: string | null;
  imageUrls: string[]; // Add this field
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
          {/* Header section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Your Hotels
            </h1>
            <Link
              href="/hotel-manage/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add New Hotel
            </Link>
          </div>

          {/* Hotels grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedHotels.map((hotel) => (
              <Link key={hotel.id} href={`/hotel-manage/${hotel.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 relative flex-shrink-0">
                    {hotel.logoUrl ? (
                      <img
                        src={hotel.logoUrl}
                        alt={`${hotel.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : hotel.imageUrls && hotel.imageUrls.length > 0 ? (
                      <img
                        src={hotel.imageUrls[0]}
                        alt={`${hotel.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaHotel className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  {/* Hotel info */}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {hotel.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {hotel.city}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{hotel.starRating}</span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">
                        {hotel.totalRooms} room types
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
}