'use client';

import ImageCarousel from './ImageCarousel';

interface RoomTypeCardProps {
  type: string;
  amenities: string[];
  pricePerNight: number;
  availableRooms: number;
  totalRooms: number;
  images: string[];
}

export default function RoomTypeCard({
  type,
  amenities,
  pricePerNight,
  availableRooms,
  totalRooms,
  images
}: RoomTypeCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Room Images Carousel */}
      <ImageCarousel images={images} alt={type} height="h-64" />

      {/* Room Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {type}
        </h3>
        <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
          ${pricePerNight.toFixed(2)} <span className="text-sm text-gray-600 dark:text-gray-400">per night</span>
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Availability:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {availableRooms} / {totalRooms} rooms
            </span>
          </div>
          
          <div className="border-t pt-3">
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
        </div>
      </div>
    </div>
  );
}