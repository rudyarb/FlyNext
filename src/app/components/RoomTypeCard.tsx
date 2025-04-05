'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageCarousel from './ImageCarousel';
import ImageWithFallback from './ImageWithFallback';
import { FaImage } from 'react-icons/fa';

interface RoomTypeCardProps {
  id: string;
  hotelId: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  availableRooms: number;
  totalRooms: number;
  imageUrls: string[]; // Changed from images to imageUrls for consistency
  showAvailability?: boolean;
  isAvailable?: boolean;
  checkIn?: string;
  checkOut?: string;
}

export default function RoomTypeCard({
  id,
  hotelId,
  type,
  amenities,
  pricePerNight,
  availableRooms,
  totalRooms,
  imageUrls, // Changed from images
  showAvailability = false,
  isAvailable = true,
  checkIn,
  checkOut
}: RoomTypeCardProps) {
  const router = useRouter();

  // Update the debug logging
  console.log('RoomTypeCard imageUrls:', {
    imageUrls,
    isArray: Array.isArray(imageUrls),
    length: imageUrls?.length,
    firstUrl: imageUrls?.[0]
  });

  // Ensure imageUrls is always an array and contains valid URLs
  const safeImageUrls = Array.isArray(imageUrls) 
    ? imageUrls.filter(url => {
        const isValid = url && typeof url === 'string' && url.trim().length > 0;
        if (!isValid) {
          console.log('Invalid image URL found:', url);
        }
        return isValid;
      })
    : [];

  console.log('Filtered image URLs:', safeImageUrls);

  const handleBooking = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      const bookingUrl = `/hotel/${hotelId}/book?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}`;
      localStorage.setItem('redirectAfterLogin', bookingUrl);
      router.push('/users/login');
      return;
    }
    router.push(`/hotel/${hotelId}/book?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col
      transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-blue-500 border-2 border-transparent
      ${!isAvailable && showAvailability ? 'opacity-60' : ''}`}>
      
      {/* Room Images Carousel */}
      <div className="h-64 flex-shrink-0">
        {safeImageUrls.length > 0 ? (
          <ImageCarousel 
            images={safeImageUrls}
            alt={`${type} room images`}
            height="h-64"
          />
        ) : (
          <div className="h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <FaImage className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Room Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className={`text-xl font-bold mb-2
          ${!isAvailable && showAvailability ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {type}
          {!isAvailable && showAvailability && ' (Unavailable)'}
        </h3>
        <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
          ${pricePerNight.toFixed(2)} <span className="text-sm text-gray-600 dark:text-gray-400">per night</span>
        </p>

        {showAvailability && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 dark:text-gray-300">Availability:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {availableRooms} / {totalRooms} rooms
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Amenities:</h4>
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

        {/* Book Room Button */}
        <div className="pt-4">
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
  );
}