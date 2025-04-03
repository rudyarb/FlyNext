'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaHotel, FaBed, FaCalendar, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface RoomType {
  id: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  quantity: number;
  availability: number;
}

interface HotelDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  starRating: number;
  logo: string | null;
  images: string[];
  roomTypes: RoomType[];
}

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'CONFIRMED' | 'CANCELLED';
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  roomType: {
    type: string;
  };
}

export default function HotelManageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.hotelId as string;

  const [activeTab, setActiveTab] = useState<'details' | 'rooms' | 'bookings'>('details');
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchHotelData() {
      try {
        const token = localStorage.getItem('token');
        const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
        
        if (!token || !payload) {
          router.push('/users/login?redirect=/hotel-manage');
          return;
        }

        const headers = {
          'x-user': payload.id, // Send just the ID, not a stringified object
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [hotelRes, bookingsRes] = await Promise.all([
          fetch(`/api/hotel/manage/${hotelId}`, { headers }),
          fetch(`/api/hotel/manage/${hotelId}/bookings`, { headers })
        ]);

        if (hotelRes.status === 401 || bookingsRes.status === 401) {
          router.push('/users/login?redirect=/hotel-manage');
          return;
        }

        if (!hotelRes.ok || !bookingsRes.ok) {
          throw new Error('Failed to fetch hotel data');
        }

        const [hotelData, bookingsData] = await Promise.all([
          hotelRes.json(),
          bookingsRes.json()
        ]);

        setHotel(hotelData);
        setBookings(bookingsData.bookings);
      } catch (error) {
        setError('Failed to load hotel details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHotelData();
  }, [hotelId, router]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      
      if (!token || !payload) {
        router.push('/users/login?redirect=/hotel-manage');
        return;
      }

      const response = await fetch(`/api/hotel/manage/${hotelId}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'x-user': JSON.stringify({ id: payload.id }),
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      // Refresh bookings
      const bookingsRes = await fetch(`/api/hotel/manage/${hotelId}/bookings`);
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300">Loading hotel details...</div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/hotel-manage')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to hotel management
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {hotel.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {hotel.city} • {hotel.address}
              </p>
            </div>
            <button
              onClick={() => router.push('/hotel-manage')}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 
                dark:hover:text-white transition-colors"
            >
              Back to Hotels
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-8">
              {['details', 'rooms', 'bookings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`pb-4 px-2 capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'details' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* Add hotel details editing form here */}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {hotel.roomTypes.map((room) => (
                <div
                  key={room.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {room.type}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        ${room.pricePerNight} per night
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {/* Add edit handler */}}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {/* Add delete handler */}}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Availability:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {room.availability}/{room.quantity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Amenities:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {room.amenities.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {/* Add new room type handler */}}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 
                  rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 
                  hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus />
                Add New Room Type
              </button>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Room Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {`${booking.user.firstName} ${booking.user.lastName}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {booking.roomType.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(booking.checkInDate).toLocaleDateString()} - 
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${booking.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 
                                dark:hover:text-red-300"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}