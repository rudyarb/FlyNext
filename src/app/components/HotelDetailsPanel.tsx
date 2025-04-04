import React, { useRef, useState } from 'react';
import { FaImage, FaTrash, FaUpload, FaStar } from 'react-icons/fa';

interface HotelDetailsPanelProps {
  hotel: {
    id: string;
    name: string;
    address: string;
    city: string;
    starRating: number;
    logoPath: string | null;
    imagePaths: string[];
  } | null;
  formData: {
    name: string;
    address: string;
    city: string;
    starRating: number;
    logo: File | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onImageDelete: (path: string) => Promise<void>;
  onLogoUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  successMessage?: string;
}

const HotelDetailsPanel: React.FC<HotelDetailsPanelProps> = ({
  hotel,
  formData,
  setFormData,
  onSubmit,
  onImageUpload,
  onImageDelete,
  onLogoUpload,
  isLoading,
  successMessage
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        setErrorMessage('Unsupported file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        return;
      }
      setErrorMessage('');
      onLogoUpload(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const hasInvalidFile = files.some(file => !SUPPORTED_IMAGE_TYPES.includes(file.type));
    
    if (hasInvalidFile) {
      setErrorMessage('Unsupported file type. Please upload JPEG, PNG, GIF, or WebP images only.');
      return;
    }
    
    setErrorMessage('');
    onImageUpload(e);
  };

  return (
    <div className="p-8">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        {/* Logo Section */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hotel Identity
          </h3>
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="relative group">
                {hotel?.logoPath ? (
                  <div className="relative group">
                    <img
                      src={`/api/images${hotel.logoPath}`}
                      alt="Hotel logo"
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <label className="cursor-pointer">
                        <FaUpload className="h-8 w-8 text-white" />
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                    <FaUpload className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Upload Logo</span>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-grow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hotel Name*
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                  placeholder="Enter hotel name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City*
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Star Rating*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.starRating}
                      onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, starRating: Number(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none pr-10"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>
                          {rating} Star{rating > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                    <FaStar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Address*
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hotel Images
            </h3>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaUpload className="mr-2" />
              Add Images
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {hotel?.imagePaths.map((path, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={`/api/images${path}`}
                  alt={`Hotel image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onImageDelete(path)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelDetailsPanel;