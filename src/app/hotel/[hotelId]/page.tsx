'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HotelDetails from '@/app/components/HotelDetails';
import RoomTypeCard from '@/app/components/RoomTypeCard';

interface RoomType {
  id: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  imageUrls: string[];
  quantity: number;
  availableRooms: number;
}

interface HotelDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  starRating: number;
  logoUrl: string | null;    // Changed from logo
  imageUrls: string[];       // Changed from images
  roomTypes: RoomType[];
}

export default function HotelDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params.hotelId as string;

  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [roomAvailability, setRoomAvailability] = useState<RoomType[]>([]);
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);

  // Update the handleCheckInChange function
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    
    // If check-out date exists and is now invalid, update it
    if (checkOut && checkOut <= newCheckIn) {
      // Set check-out to the day after check-in
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  // Add a handler for checkout changes
  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckOut(e.target.value);
  };

  // Replace the separate initialization effects with a single combined effect
  useEffect(() => {
    if (!hotelId) return;
    
    async function initializeHotelPage() {
      try {
        // First fetch hotel details
        const response = await fetch(`/api/hotel/search/details/${hotelId}`);
        if (!response.ok) throw new Error('Failed to fetch hotel details');
        const data = await response.json();
        setHotelDetails(data.hotelDetails);
        setRoomAvailability(data.hotelDetails.roomTypes);

        // Then check for dates in URL and fetch availability if present
        const checkInParam = searchParams.get('checkIn');
        const checkOutParam = searchParams.get('checkOut');

        if (checkInParam && checkOutParam) {
          setCheckIn(checkInParam);
          setCheckOut(checkOutParam);
          
          // Fetch availability after hotel details are loaded
          const availabilityResponse = await fetch(
            `/api/hotel/search/details/${hotelId}/date-availability?checkIn=${checkInParam}&checkOut=${checkOutParam}`
          );
          if (!availabilityResponse.ok) throw new Error('Failed to fetch room availability');
          const availabilityData = await availabilityResponse.json();
          setRoomAvailability(availabilityData.availability);
          setHasCheckedAvailability(true);
        }
      } catch (error) {
        setError('Failed to load hotel details');
        console.error('Error:', error);
      }
    }

    initializeHotelPage();
  }, [hotelId, searchParams]); // Include searchParams in dependencies

  // Update the date change effect
  useEffect(() => {
    if (!hotelDetails || !checkIn || !checkOut) return;
    
    // Only fetch availability if both dates are present
    fetchRoomAvailability(checkIn, checkOut);
  }, [checkIn, checkOut, hotelDetails]); // Add hotelDetails as dependency

  async function fetchRoomAvailability(checkInDate = checkIn, checkOutDate = checkOut) {
    if (!checkInDate || !checkOutDate) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `/api/hotel/search/details/${hotelId}/date-availability?checkIn=${checkInDate}&checkOut=${checkOutDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch room availability');
      const data = await response.json();
      setRoomAvailability(data.availability);
      setHasCheckedAvailability(true);
    } catch (error) {
      setError('Failed to check room availability');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checkIn && !checkOut) return;
    
    // Update URL parameters
    const params = new URLSearchParams(window.location.search);
    
    if (checkIn) {
      params.set('checkIn', checkIn);
    } else {
      params.delete('checkIn');
    }
    
    if (checkOut) {
      params.set('checkOut', checkOut);
    } else {
      params.delete('checkOut');
    }

    // Update URL without page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [checkIn, checkOut]);

  const sortedRoomTypes = roomAvailability.sort((a, b) => {
    // First sort by availability
    if (checkIn && checkOut) {
      if (a.availableRooms > 0 && b.availableRooms === 0) return -1;
      if (a.availableRooms === 0 && b.availableRooms > 0) return 1;
    }
    // Then sort by price
    return a.pricePerNight - b.pricePerNight;
  });

  if (!hotelDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-700 dark:text-gray-300">
          {error || 'Loading hotel details...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hotel Details Section */}
          <HotelDetails 
            name={hotelDetails.name}
            address={hotelDetails.address}
            city={hotelDetails.city}
            starRating={hotelDetails.starRating}
            logoUrl={hotelDetails.logoUrl}       // Changed from logoPath
            imageUrls={hotelDetails.imageUrls}   // Changed from imagePaths
          />

          {/* Date Selection Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Select the length of your stay:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="text-gray-700 dark:text-gray-300">Check-In Date</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={handleCheckInChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-gray-700 dark:text-gray-300">Check-Out Date</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={handleCheckOutChange}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </label>
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex items-center gap-4">
              {loading ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Checking availability...
                </p>
              ) : (!checkIn || !checkOut) ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select check-in and check-out dates to see room availability
                </p>
              ) : null}
            </div>
          </div>

          {/* Room Types Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {checkIn && checkOut 
                ? `Available Rooms from: ${checkIn} to ${checkOut}` 
                : 'Rooms'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roomAvailability.length > 0 ? (
                sortedRoomTypes.map((room) => (
                  <RoomTypeCard 
                    key={room.id} 
                    {...room}
                    imageUrls={room.imageUrls || []}
                    hotelId={hotelId}
                    showAvailability={!!(checkIn && checkOut && hasCheckedAvailability)}
                    isAvailable={room.availableRooms > 0}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    totalRooms={room.quantity}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-700 dark:text-gray-300">
                  No rooms available
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}