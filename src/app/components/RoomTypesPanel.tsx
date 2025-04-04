import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import RoomTypeForm from './RoomTypeForm';

interface RoomType {
  id: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  quantity: number;
  availability: number;
}

interface RoomTypesPanelProps {
  hotelId: string;
  roomTypes: RoomType[];
  onUpdate: () => void;
}

const RoomTypesPanel: React.FC<RoomTypesPanelProps> = ({
  hotelId,
  roomTypes,
  onUpdate
}) => {
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [error, setError] = useState<string>('');

  const handleAddSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/hotel/manage/${hotelId}/create-roomtype`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create room type');
      }

      setIsAddingRoom(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room type');
    }
  };

  const handleEditSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/hotel/manage/${hotelId}/edit-roomtype`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update room type');
      }

      setEditingRoomType(null);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room type');
    }
  };

  const handleDelete = async (roomTypeId: string) => {
    if (!confirm('Are you sure you want to delete this room type?')) return;

    try {
      const response = await fetch(
        `/api/hotel/manage/${hotelId}/roomtype/${roomTypeId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete room type');
      }

      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room type');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Room Types
        </h3>
        <button
          onClick={() => setIsAddingRoom(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaPlus className="mr-2" />
          Add Room Type
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isAddingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Room Type
            </h3>
            <RoomTypeForm
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddingRoom(false)}
            />
          </div>
        </div>
      )}

      {editingRoomType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4">
            <h3 className="text-xl font-semibold mb-4">Edit Room Type</h3>
            <RoomTypeForm
              initialData={editingRoomType}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingRoomType(null)}
              isEditing={true}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {roomTypes.map(room => (
          <div
            key={room.id}
            className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {room.type}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${room.pricePerNight}/night · {room.quantity} rooms
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingRoomType(room)}
                  className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            {room.images && room.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {room.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${room.type} image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomTypesPanel;