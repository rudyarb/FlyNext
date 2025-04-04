'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHotel, FaBed, FaImage, FaTrash, FaUpload, FaCalendar } from 'react-icons/fa';
import TabPanel from '@/app/components/TabPanel';
import ImageReorderModal from '@/app/components/ImageReorderModal';
import HotelDetailsPanel from '@/app/components/HotelDetailsPanel';
import RoomTypesPanel from '@/app/components/RoomTypesPanel';
import BookingsPanel from '@/app/components/BookingsPanel';
import AuthWrapper from '@/app/components/AuthWrapper';
import { classNames } from '@/utils/styling';
import Link from 'next/link';

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
  const [activeTab, setActiveTab] = useState(0);
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    starRating: 1,
    logo: null as File | null
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
        starRating: data.starRating,
        logo: null
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
    setSuccessMessage('');

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
      setSuccessMessage('Hotel details updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
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

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload logo');
      }

      setHotel(prev => prev ? { ...prev, logoPath: data.logoPath } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    }
  };

  const handleImageDelete = async (imagePath: string) => {
    try {
      const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePaths: hotel?.imagePaths.filter(path => path !== imagePath)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setHotel(prev => prev ? {
        ...prev,
        imagePaths: prev.imagePaths.filter(path => path !== imagePath)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const tabs = [
    { name: 'Hotel Details', icon: FaHotel },
    { name: 'Room Types', icon: FaBed },
    { name: 'Bookings', icon: FaCalendar }
  ];

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Hotel Management
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your hotel details and room types
                </p>
              </div>
              <Link
                href="/hotel-manage"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 
                  transition-colors shadow-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Back to Hotels
              </Link>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(index)}
                      className={classNames(
                        activeTab === index
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
                        'group inline-flex items-center py-4 px-1 border-b-2 font-medium'
                      )}
                    >
                      <tab.icon className={classNames(
                        activeTab === index
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400',
                        'mr-3 h-5 w-5'
                      )} />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <TabPanel value={activeTab} index={0}>
                <HotelDetailsPanel 
                  hotel={hotel}
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  onImageUpload={handleImageUpload}
                  onImageDelete={handleImageDelete}
                  onLogoUpload={handleLogoUpload}
                  isLoading={isLoading}
                  successMessage={successMessage}
                />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <RoomTypesPanel
                  hotelId={resolvedParams.hotelId}
                  roomTypes={hotel?.roomTypes || []}
                  onUpdate={() => fetchHotelDetails(resolvedParams.hotelId)}
                />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <BookingsPanel hotelId={resolvedParams.hotelId} />
              </TabPanel>
            </div>
          </div>
        </div>
      </div>

      {/* Image Reorder Modal */}
      {isImageModalOpen && (
        <ImageReorderModal
          images={hotel?.imagePaths || []}
          onClose={() => setIsImageModalOpen(false)}
          onSave={async (newOrder) => {
            try {
              const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imagePaths: newOrder }),
              });

              if (!response.ok) throw new Error('Failed to update image order');

              const data = await response.json();
              setHotel(prev => prev ? { ...prev, imagePaths: newOrder } : null);
              setIsImageModalOpen(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to update image order');
            }
          }}
        />
      )}
    </AuthWrapper>
  );
}