'use client';

import ImageCarousel from './ImageCarousel';

interface HotelDetailsProps {
  name: string;
  address: string;
  city: string;
  starRating: number;
  logo: string | null;
  images: string[];
}

export default function HotelDetails({ 
  name, 
  address, 
  city, 
  starRating, 
  logo, 
  images 
}: HotelDetailsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Image Carousel */}
      <ImageCarousel images={images} alt={name} height="h-96" />

      {/* Hotel Info */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          {logo && (
            <img
              src={logo}
              alt={name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {address}, {city}
            </p>
            <div className="flex items-center mt-1">
              {[...Array(starRating)].map((_, i) => (
                <span key={`star-${name}-${i}`} className="text-yellow-400">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}