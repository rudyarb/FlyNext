'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

interface RoomType {
  id: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  quantity: number;
  availability: number;
}

interface RoomTypeManagerProps {
  hotelId: string;
  roomTypes: RoomType[];
}

export default function RoomTypeManager({ hotelId, roomTypes: initialRoomTypes }: RoomTypeManagerProps) {
  const [roomTypes, setRoomTypes] = useState(initialRoomTypes);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent, room: RoomType) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/hotel/manage/${hotelId}/edit-roomtype/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(room),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update room');
      }

      setRoomTypes(prev => prev.map(r => r.id === room.id ? room : r));
      setEditingRoom(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room');
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const response = await fetch(`/api/hotel/manage/${hotelId}/create-roomtype`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      setRoomTypes(prev => [...prev, data.roomType]);
      setIsAddingRoom(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room type?')) return;

    try {
      const response = await fetch(`/api/hotel/manage/${hotelId}/delete-roomtype/${roomId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete room');
      }

      setRoomTypes(prev => prev.filter(r => r.id !== roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Room Types
        </h2>
        <button
          onClick={() => setIsAddingRoom(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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

      <div className="space-y-6">
        {roomTypes.map(room => (
          <div
            key={room.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            {editingRoom?.id === room.id ? (
              <form onSubmit={(e) => handleSubmit(e, editingRoom)} className="space-y-4">
                {/* Room editing form fields */}
                {/* Add form fields for all room properties */}
              </form>
            ) : (
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {room.type}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    ${room.pricePerNight} per night
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {room.availability} of {room.quantity} rooms available
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Room Modal */}
      {isAddingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Add New Room Type
            </h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              {/* Add form fields for new room */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAddingRoom(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Room Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}