'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageCarousel from './ImageCarousel';

interface RoomTypeCardProps {
  id: string; // Add this prop
  hotelId: string; // Add this prop
  type: string;
  amenities: string[];
  pricePerNight: number;
  availableRooms: number;
  totalRooms: number;
  images: string[];
  showAvailability?: boolean;
  isAvailable?: boolean;
  checkIn?: string; // Add this prop
  checkOut?: string; // Add this prop
}

export default function RoomTypeCard({
  id,
  hotelId,
  type,
  amenities,
  pricePerNight,
  availableRooms,
  totalRooms,
  images,
  showAvailability = false,
  isAvailable = true,
  checkIn,
  checkOut
}: RoomTypeCardProps) {
  const router = useRouter();

  const handleBooking = () => {
    // Check if user is authenticated by looking for token
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Store the intended destination URL
      const bookingUrl = `/hotel/${hotelId}/book?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}`;
      localStorage.setItem('redirectAfterLogin', bookingUrl);
      
      // Redirect to login
      router.push('/users/login');
      return;
    }

    // If authenticated, proceed to booking page
    router.push(`/hotel/${hotelId}/book?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[600px] flex flex-col
      transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-blue-500 border-2 border-transparent
      ${!isAvailable && showAvailability ? 'opacity-60' : ''}`}>
      {/* Room Images Carousel - Fixed height */}
      <div className="h-64 flex-shrink-0">
        <ImageCarousel images={images} alt={type} height="h-64" />
      </div>

      {/* Room Info - Flex grow with internal scrolling if needed */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`text-xl font-bold mb-2 flex-shrink-0
          ${!isAvailable && showAvailability ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {type}
          {!isAvailable && showAvailability && ' (Unavailable)'}
        </h3>
        <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4 flex-shrink-0">
          ${pricePerNight.toFixed(2)} <span className="text-sm text-gray-600 dark:text-gray-400">per night</span>
        </p>
        
        <div className="flex-1 flex flex-col min-h-0">
          {showAvailability && (
            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-gray-600 dark:text-gray-300">Availability:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {availableRooms} / {totalRooms} rooms
              </span>
            </div>
          )}
          
          <div className={`${showAvailability ? "border-t pt-3" : ""} flex-1 overflow-y-auto`}>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Amenities:
            </h4>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Book Room button - Fixed at bottom */}
          <div className="pt-4 mt-auto flex-shrink-0">
            {showAvailability ? (
              <button
                onClick={handleBooking}
                disabled={!isAvailable}
                className={`w-full py-2 px-4 rounded-md font-semibold transition-colors text-center
                  ${isAvailable
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isAvailable ? 'Book Room' : 'No Availability'}
              </button>
            ) : (
              <span className="w-full py-2 px-4 rounded-md font-semibold transition-colors text-center block
                bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                Select Dates to Book
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}