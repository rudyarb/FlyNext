'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingDetails {
  hotelName: string;
  roomType: string;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  nightsCount: number;
  totalPrice: number;
}

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const hotelId = params.hotelId as string;
  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Fetch booking details
  useEffect(() => {
    async function fetchBookingDetails() {
      if (!hotelId || !roomId || !checkIn || !checkOut) {
        setError('Missing required booking information');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/hotel/booking/details?hotelId=${hotelId}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch booking details');
        
        const data = await response.json();
        setBookingDetails(data);
      } catch (error) {
        setError('Failed to load booking details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [hotelId, roomId, checkIn, checkOut]);

  const handleBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hotel/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId,
          roomId,
          checkIn,
          checkOut,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirect to booking confirmation page
      router.push(`/bookings/${data.bookingId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-700 dark:text-gray-300">
          Loading booking details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Link 
            href={`/hotel/${hotelId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to hotel details
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingDetails) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Booking Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Confirm Your Booking
              </h1>

              {/* Hotel and Room Details */}
              <div className="space-y-4">
                <h2 className="text-xl text-gray-900 dark:text-white">
                  {bookingDetails.hotelName}
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  <p className="font-medium">{bookingDetails.roomType}</p>
                  <p>Check-in: {new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
                  <p>{bookingDetails.nightsCount} night(s)</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Price per night</span>
                    <span>${bookingDetails.pricePerNight.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Number of nights</span>
                    <span>{bookingDetails.nightsCount}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>${bookingDetails.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md shadow-md 
                    hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
                <Link
                  href={`/hotel/${hotelId}`}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 
                    dark:text-gray-200 rounded-md shadow-md text-center
                    hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Important Information
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Check-in time starts at 3 PM</li>
              <li>Check-out time is 12 PM</li>
              <li>Please present valid ID and credit card at check-in</li>
              <li>No smoking in rooms</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}