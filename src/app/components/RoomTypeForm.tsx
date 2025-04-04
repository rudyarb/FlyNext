import { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface RoomTypeFormProps {
  initialData?: {
    id?: string;
    type: string;
    pricePerNight: number;
    quantity: number;
    amenities: string[];
    images: string[];
  };
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function RoomTypeForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: RoomTypeFormProps) {
  const [amenity, setAmenity] = useState('');
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate type
    const type = formData.get('type') as string;
    if (!type || type.trim().length === 0) {
      newErrors.type = 'Room type name is required';
    }

    // Validate price
    const price = parseFloat(formData.get('pricePerNight') as string);
    if (isNaN(price) || price <= 0) {
      newErrors.pricePerNight = 'Price must be greater than 0';
    }

    // Validate quantity
    const quantity = parseInt(formData.get('quantity') as string);
    if (isNaN(quantity) || quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    // Validate amenities
    if (amenities.length === 0) {
      newErrors.amenities = 'At least one amenity is required';
    }

    // Validate images
    if (!isEditing && selectedFiles.length === 0 && (!initialData?.images || initialData.images.length === 0)) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    if (!validateForm(formData)) {
      return;
    }

    // Add amenities array
    formData.set('amenities', JSON.stringify(amenities));
    
    // Add existing images if editing
    if (isEditing && initialData?.images) {
      formData.set('existingImages', JSON.stringify(initialData.images));
    }

    // Add selected files
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    await onSubmit(formData);
  };

  const handleAddAmenity = () => {
    if (amenity.trim()) {
      setAmenities([...amenities, amenity.trim()]);
      setAmenity('');
      setErrors({ ...errors, amenities: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
      setErrors({ ...errors, images: '' });
    }
  };

  const baseInputStyles = `
    mt-2 block w-full rounded-md 
    px-3 py-2.5
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    border border-gray-300 dark:border-gray-600
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    shadow-sm
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    dark:focus:ring-blue-400 dark:focus:border-blue-400
    transition-colors duration-200
  `;

  const getInputClassName = (errorKey: string) => `
    ${baseInputStyles}
    ${errors[errorKey] ? 'border-red-500 dark:border-red-500' : ''}
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900 dark:text-gray-100">
      {isEditing && initialData?.id && (
        <input type="hidden" name="roomTypeId" value={initialData.id} />
      )}
      
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Room Type Name
        </label>
        <input
          type="text"
          name="type"
          defaultValue={initialData?.type}
          required
          className={getInputClassName('type')}
          placeholder="Enter room type name"
        />
        {errors.type && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Price per Night ($)
        </label>
        <input
          type="number"
          name="pricePerNight"
          defaultValue={initialData?.pricePerNight}
          required
          min="0.01"
          step="0.01"
          className={getInputClassName('pricePerNight')}
          placeholder="0.00"
        />
        {errors.pricePerNight && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.pricePerNight}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Quantity
        </label>
        <input
          type="number"
          name="quantity"
          defaultValue={initialData?.quantity}
          required
          min="1"
          className={getInputClassName('quantity')}
          placeholder="1"
        />
        {errors.quantity && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Amenities
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={amenity}
            onChange={(e) => setAmenity(e.target.value)}
            className={getInputClassName('amenities')}
            placeholder="Add an amenity"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
          />
          <button
            type="button"
            onClick={handleAddAmenity}
            disabled={!amenity.trim()}
            className="px-3 py-2.5 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {amenities.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-sm 
                bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {item}
              <button
                type="button"
                onClick={() => setAmenities(amenities.filter((_, i) => i !== index))}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        {errors.amenities && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.amenities}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className={`
            ${baseInputStyles}
            file:mr-4 file:py-2 file:px-4 
            file:rounded-md file:border-0 
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700 
            dark:file:bg-blue-900/30 dark:file:text-blue-200
            hover:file:bg-blue-100 dark:hover:file:bg-blue-800/30
            ${errors.images ? 'border-red-500' : ''}
          `}
        />
        {errors.images && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.images}</p>
        )}
      </div>

      {isEditing && initialData?.images && initialData.images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {initialData.images.map((image, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={image}
                alt={`Room image ${index + 1}`}
                className="w-full h-24 object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border rounded-md
            text-gray-900 dark:text-gray-100
            border-gray-300 dark:border-gray-600
            hover:bg-gray-50 dark:hover:bg-gray-700/50
            transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-md
            bg-blue-600 dark:bg-blue-500
            text-white font-medium
            hover:bg-blue-700 dark:hover:bg-blue-600
            transition-colors duration-200"
        >
          {isEditing ? 'Update Room Type' : 'Create Room Type'}
        </button>
      </div>
    </form>
  );
}