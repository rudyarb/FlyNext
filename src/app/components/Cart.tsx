'use client';

import { useState, useEffect } from 'react';
import { FlightBooking } from './FlightSearch'; // Import FlightBooking

// Update the interfaces at the top
interface HotelBooking {
  id: string;
  hotel: {
    id: string;
    name: string;
    address: string;
    city: string;
    starRating: number;
    logoPath: string | null;
    imagePaths: string[];
  };
  roomType: {
    type: string;
    pricePerNight: number;
  };
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export default function Cart() {
  const [flights, setFlights] = useState<FlightBooking[]>([]);
  const [hotels, setHotels] = useState<HotelBooking[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem('token'));
  }, []);

  const fetchCartData = async () => {
    try {
      const flightResponse = await fetch('/api/flight-booking', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const hotelResponse = await fetch('/api/hotel-booking', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (flightResponse.ok) {
        const flightData = await flightResponse.json();
        if (Array.isArray(flightData)) {
          setFlights(flightData);
          console.log('Fetched flight data:', flightData); // Debugging line
        } else {
          console.error('Unexpected flight data format:', flightData);
        }
      } else {
        console.error('Failed to fetch flights:', flightResponse.statusText);
      }

      if (hotelResponse.ok) {
        const hotelData = await hotelResponse.json();
        if (Array.isArray(hotelData)) {
          setHotels(hotelData);
          console.log('Fetched hotel data:', hotelData); // Debugging line
        } else {
          console.error('Unexpected hotel data format:', hotelData);
        }
      } else {
        console.error('Failed to fetch hotels:', hotelResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const handleCartToggle = () => {
    if (!isOpen) {
      fetchCartData(); // Fetch data when opening the cart
    }
    setIsOpen(!isOpen);
  };

  if (!isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mt-2 bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg w-[400px] max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Cart</h3>
            <button
              onClick={handleCartToggle}
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Close Cart
            </button>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Flights:</h4>
            {flights.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                {flights.map((flight: FlightBooking, index) => (
                  <li key={index} className="break-words">
                    {flight.flightNumber} - {flight.originCity} ({flight.originCode}) to {flight.destinationCity} ({flight.destinationCode})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No flights in cart.</p>
            )}
          </div>
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Hotels:</h4>
            {hotels.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-3">
                {hotels.map((booking, index) => (
                  <li key={booking.id} className="break-words">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium">{booking.hotel.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{booking.hotel.city}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.roomType.type} Room - ${booking.roomType.pricePerNight}/night
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No hotels in cart.</p>
            )}
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          onClick={handleCartToggle}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Open Cart
        </button>
      )}
    </div>
  );
}
