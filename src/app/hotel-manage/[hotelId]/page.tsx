'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHotel, FaBed, FaImage, FaTrash, FaUpload, FaCalendar } from 'react-icons/fa';
import TabPanel from '@/app/components/TabPanel';
import ImageReorderModal from '@/app/components/ImageReorderModal';
import HotelDetailsPanel from '@/app/components/HotelDetailsPanel';
import RoomTypesPanel from '@/app/components/RoomTypesPanel';
import BookingsPanel from '@/app/components/BookingsPanel';
import RoomAvailabilityPanel from '@/app/components/RoomAvailabilityPanel';
import AuthWrapper from '@/app/components/AuthWrapper';
import { classNames } from '@/utils/styling';
import Link from 'next/link';

interface HotelDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  starRating: number;
  logoUrl: string | null; // Changed from logoPath
  imageUrls: string[]; // Changed from imagePaths
  roomTypes: RoomType[];
}

interface RoomType {
  id: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  imageUrls: string[];
  quantity: number;
  availability: number;
}

interface FormData {
  name: string;
  address: string;
  city: string;
  starRating: number;
  logo: File | null;
  logoPreview: string | null;
  pendingImages: File[];  // Add this line
  pendingImagePreviews: string[];  // Add this line
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
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    starRating: 1,
    logo: null,
    logoPreview: null,
    pendingImages: [],
    pendingImagePreviews: []
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/users/login?redirect=/hotel-manage');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchHotelDetails = async (hotelId: string) => {
    if (!token) return;

    try {
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
        logo: null,
        logoPreview: null,
        pendingImages: [],
        pendingImagePreviews: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedParams.hotelId && token) {
      fetchHotelDetails(resolvedParams.hotelId);
    }
  }, [resolvedParams.hotelId, token]);

  useEffect(() => {
    return () => {
      if (formData.logoPreview) {
        URL.revokeObjectURL(formData.logoPreview);
      }
      formData.pendingImagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [formData.logoPreview, formData.pendingImagePreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    try {
      // First update basic hotel details
      if (formData.name || formData.address || formData.city || formData.starRating) {
        const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            address: formData.address,
            city: formData.city,
            starRating: formData.starRating,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update hotel details');
        }
      }

      // Then handle file uploads if any
      if (formData.logo || formData.pendingImages.length > 0) {
        const fileFormData = new FormData();
        
        if (formData.logo) {
          fileFormData.append('logo', formData.logo);
        }
        
        formData.pendingImages.forEach(file => {
          fileFormData.append('images', file);
        });

        const uploadResponse = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
          method: 'POST',
          body: fileFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images');
        }
      }

      // Refresh hotel data
      await fetchHotelDetails(resolvedParams.hotelId);
      
      // Clear pending uploads
      formData.pendingImagePreviews.forEach(URL.revokeObjectURL);
      setFormData(prev => ({
        ...prev,
        logo: null,
        logoPreview: null,
        pendingImages: [],
        pendingImagePreviews: []
      }));

      setSuccessMessage('Hotel details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update hotel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newImages = Array.from(e.target.files);
    const newPreviews = newImages.map(file => URL.createObjectURL(file));

    setFormData(prev => ({
      ...prev,
      pendingImages: [...prev.pendingImages, ...newImages],
      pendingImagePreviews: [...prev.pendingImagePreviews, ...newPreviews]
    }));
  };

  const handleLogoUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      logo: file,
      logoPreview: previewUrl
    }));
  };

  const handleImageDelete = async (imagePath: string) => {
    try {
      const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls: hotel?.imageUrls.filter(path => path !== imagePath)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setHotel(prev => prev ? {
        ...prev,
        imageUrls: prev.imageUrls.filter(path => path !== imagePath)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const tabs = [
    { name: 'Hotel Details', icon: FaHotel },
    { name: 'Room Types', icon: FaBed },
    { name: 'Bookings', icon: FaCalendar },
    { name: 'Availability', icon: FaCalendar }
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

              <TabPanel value={activeTab} index={3}>
                <RoomAvailabilityPanel hotelId={resolvedParams.hotelId} />
              </TabPanel>
            </div>
          </div>
        </div>
      </div>

      {/* Image Reorder Modal */}
      {isImageModalOpen && (
        <ImageReorderModal
          images={hotel?.imageUrls || []}
          onClose={() => setIsImageModalOpen(false)}
          onSave={async (newOrder) => {
            try {
              const response = await fetch(`/api/hotel/manage/${resolvedParams.hotelId}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrls: newOrder }),
              });

              if (!response.ok) throw new Error('Failed to update image order');

              const data = await response.json();
              setHotel(prev => prev ? { ...prev, imageUrls: newOrder } : null);
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