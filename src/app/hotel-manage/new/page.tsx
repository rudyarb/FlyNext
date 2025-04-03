'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHotel, FaStar, FaImage, FaUpload } from 'react-icons/fa';

interface FormData {
  name: string;
  logo: string;
  address: string;
  city: string;
  starRating: number;
  images: string[];
}

export default function CreateHotelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    logo: '',
    address: '',
    city: '',
    starRating: 3,
    images: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;

      if (!token || !payload) {
        localStorage.setItem('redirectAfterLogin', '/hotel-manage/new');
        router.push('/users/login');
        return;
      }

      const response = await fetch('/api/hotel/manage/create-hotel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.setItem('redirectAfterLogin', '/hotel-manage/new');
          router.push('/users/login');
          return;
        }
        if (response.status === 403) {
          setError('Access denied. Only hotel owners can create hotels.');
          return;
        }
        throw new Error(data.error || 'Failed to create hotel');
      }

      router.push('/hotel-manage');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create hotel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('redirectAfterLogin', '/hotel-manage/new');
      router.push('/users/login');
    }
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileUrls = Array.from(files).map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...fileUrls]
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaHotel className="text-blue-600" />
              Create New Hotel
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter hotel name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter hotel address"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Star Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, starRating: star }))}
                      className={`p-2 rounded-lg ${
                        formData.starRating >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      <FaStar size={24} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Images
              </h2>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Hotel Logo
                </label>
                <div className="flex items-center gap-4">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Hotel Logo"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <label className="cursor-pointer flex items-center justify-center px-4 py-2
                    bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 
                    dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200">
                    <FaUpload className="mr-2" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData(prev => ({
                            ...prev,
                            logo: URL.createObjectURL(file)
                          }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Hotel Images *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Hotel ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full
                          opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="cursor-pointer flex items-center justify-center h-32
                    bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 
                    dark:hover:bg-gray-600 transition-colors">
                    <div className="text-center">
                      <FaImage className="mx-auto mb-2 text-gray-400" size={24} />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Add Image
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload at least one image of your hotel
                </p>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || formData.images.length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 transition-colors disabled:opacity-50
                  disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Hotel'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/hotel-manage')}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700
                  dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600
                  transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}