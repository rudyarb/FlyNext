'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const formatDate = (dateString: string) => {
  try {
    // Split the date string and ensure proper formatting
    const [year, month, day] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  } catch (e) {
    return 'Invalid date';
  }
};

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  bookingDate: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  roomType: {
    type: string;
    pricePerNight: number;
  };
}

interface BookingsPanelProps {
  hotelId: string;
}

export default function BookingsPanel({ hotelId }: BookingsPanelProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    roomType: ''
  });

  // Fetch all room types for the hotel
  const fetchRoomTypes = async () => {
    try {
      const response = await fetch(`/api/hotel/manage/${hotelId}`);
      const data = await response.json();
      if (response.ok && data.roomTypes) {
        setRoomTypes(data.roomTypes.map((rt: any) => rt.type));
      }
    } catch (err) {
      console.error('Failed to fetch room types:', err);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view bookings');
        return;
      }

      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
      if (filters.roomType) params.append('roomType', filters.roomType);

      const response = await fetch(`/api/hotel/manage/${hotelId}/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user': localStorage.getItem('user') || ''
        }
      });
      
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      
      // Sort bookings by check-in date in ascending order
      const sortedBookings = [...data.bookings].sort((a, b) => 
        new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()
      );
      
      setBookings(sortedBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [hotelId]);

  useEffect(() => {
    fetchBookings();
  }, [hotelId]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to cancel bookings');
        return;
      }

      const response = await fetch(`/api/hotel/manage/${hotelId}/bookings`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user': localStorage.getItem('user') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, roomType: e.target.value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchBookings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Manage Bookings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage all bookings for your hotel
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range
          </label>
          <DatePicker
            selectsRange
            startDate={filters.startDate}
            endDate={filters.endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setFilters(prev => ({ ...prev, startDate: update[0], endDate: update[1] }));
            }}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholderText="Select date range"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Room Type
          </label>
          <input
            type="text"
            value={filters.roomType}
            onChange={handleFilterChange}
            placeholder="Enter room type"
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchBookings}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md 
              hover:bg-blue-700 transition-colors duration-200 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilters({ startDate: null, endDate: null, roomType: '' });
            }}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md 
              hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading bookings...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400">{error}</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400">No bookings found</div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Room Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.user.firstName} {booking.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {booking.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {booking.roomType.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(booking.checkInDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(booking.checkOutDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full
                        ${booking.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300
                            focus:outline-none focus:underline"
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
        )}
      </div>
    </div>
  );
}