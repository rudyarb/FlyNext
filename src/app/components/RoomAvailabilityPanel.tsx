import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface RoomAvailability {
  id: string;
  type: string;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  currentAvailability: number;
}

interface RoomAvailabilityPanelProps {
  hotelId: string;
}

const RoomAvailabilityPanel: React.FC<RoomAvailabilityPanelProps> = ({ hotelId }) => {
  const [availabilityData, setAvailabilityData] = useState<RoomAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    roomType: '',
    startDate: null as Date | null,
    endDate: null as Date | null
  });
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (token) {
      fetchAvailability();
    }
  }, [hotelId, token]);

  const validateDates = (): boolean => {
    if (!filters.startDate || !filters.endDate) return true; // Make dates optional

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filters.startDate.getTime() < today.getTime()) {
      setError('Start date cannot be in the past');
      return false;
    }

    if (filters.endDate.getTime() <= filters.startDate.getTime()) {
      setError('End date must be after start date');
      return false;
    }

    return true;
  };

  const fetchAvailability = async () => {
    if (!token) return;

    if (!validateDates()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      if (filters.roomType) queryParams.append('roomType', filters.roomType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString().split('T')[0]);
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString().split('T')[0]);

      const response = await fetch(
        `/api/hotel/manage/${hotelId}/room-availability?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch availability data');
      }

      const data = await response.json();
      setAvailabilityData(data.roomTypeAvailability);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Room Availability
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Information about room availability for your hotel
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range
          </label>
          <DatePicker
            selectsRange
            startDate={filters.startDate}
            endDate={filters.endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setFilters(prev => ({ ...prev, startDate: update[0], endDate: update[1] }));
            }}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholderText="Select date range"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Room Type
          </label>
          <input
            type="text"
            value={filters.roomType}
            onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
            placeholder="Enter room type"
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
              text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchAvailability}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md 
              hover:bg-blue-700 transition-colors duration-200 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaSearch className="mr-2" />
                Search
              </span>
            )}
          </button>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilters({ startDate: null, endDate: null, roomType: '' });
            }}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md 
              hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Room Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Total Rooms
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Available
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Occupied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Current Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {availabilityData.map((room) => (
              <tr key={room.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {room.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {room.totalRooms}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  {room.availableRooms}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                  {room.occupiedRooms}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${room.currentAvailability > 0 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {room.currentAvailability > 0 ? 'Available' : 'Fully Booked'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomAvailabilityPanel;