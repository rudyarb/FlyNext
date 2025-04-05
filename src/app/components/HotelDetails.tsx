'use client';

import ImageWithFallback from './ImageWithFallback';
import ImageCarousel from './ImageCarousel';
import { FaImage } from 'react-icons/fa';

export interface HotelDetailsProps {
  name: string;
  address: string;
  city: string;
  starRating: number;
  logoUrl: string | null;    // Changed from logoPath
  imageUrls: string[];       // Changed from imagePaths
}

export default function HotelDetails({
  name,
  address,
  city,
  starRating,
  logoUrl,
  imageUrls
}: HotelDetailsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Image Carousel */}
      {imageUrls && imageUrls.length > 0 ? (
        <ImageCarousel 
          images={imageUrls}
          alt={name} 
          height="h-96" 
        />
      ) : (
        <div className="h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <FaImage className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Hotel Info */}
      <div className="p-6">
        <div className="flex items-center gap-4">
          <ImageWithFallback
            src={logoUrl}
            alt={`${name} logo`}
            className="w-16 h-16 rounded-full object-cover"
          />
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