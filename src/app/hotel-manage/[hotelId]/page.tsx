'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ImageReorderModal from '@/app/components/ImageReorderModal';
import RoomTypeManager from '@/app/components/RoomTypeManager';
import AuthWrapper from '@/app/components/AuthWrapper';

interface HotelDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  starRating: number;
  logoPath: string | null;
  imagePaths: string[];
  roomTypes: RoomType[];
}

interface RoomType {
  id: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  quantity: number;
  availability: number;
}

export default function HotelManagePage({ params }: { params: Promise<{ hotelId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    starRating: 1
  });

  const fetchHotelDetails = async (hotelId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/users/login?redirect=/hotel-manage');
        return;
      }

      const response = await fetch(`/api/hotel/manage/${hotelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hotel details');
      }

      setHotel(data);
      setFormData({
        name: data.name,
        address: data.address,
        city: data.city,
        starRating: data.starRating
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedParams.hotelId) {
      fetchHotelDetails(resolvedParams.hotelId);
    }
  }, [resolvedParams.hotelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update hotel');
      }

      setHotel(prev => prev ? { ...prev, ...formData } : null);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hotel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const formData = new FormData();
    Array.from(e.target.files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload images');
      }

      setHotel(prev => prev ? { ...prev, imagePaths: data.imagePaths } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Hotel Management
        </h1>

        {/* Hotel Details Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Hotel Details
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editMode ? 'Cancel' : 'Edit Details'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Star Rating
                </label>
                <select
                  value={formData.starRating}
                  onChange={(e) => setFormData(prev => ({ ...prev, starRating: Number(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Name:</span> {hotel.name}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Address:</span> {hotel.address}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">City:</span> {hotel.city}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Rating:</span> {hotel.starRating} Stars
              </p>
            </div>
          )}
        </div>

        {/* Images Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Hotel Images
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Manage Images
              </button>
              <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer">
                Upload Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {hotel.imagePaths.map((path, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={path}
                  alt={`Hotel image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Room Types Section */}
        <RoomTypeManager hotelId={resolvedParams.hotelId} roomTypes={hotel.roomTypes} />

        {/* Image Reorder Modal */}
        {isImageModalOpen && (
          <ImageReorderModal
            images={hotel.imagePaths}
            onClose={() => setIsImageModalOpen(false)}
            onSave={async (newOrder: string[]) => {
              try {
                const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ imagePaths: newOrder }),
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.error || 'Failed to update image order');
                }

                setHotel(prev => prev ? { ...prev, imagePaths: newOrder } : null);
                setIsImageModalOpen(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update image order');
              }
            }}
          />
        )}
      </div>
    </AuthWrapper>
  );
}