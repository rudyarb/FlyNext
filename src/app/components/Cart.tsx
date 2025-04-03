'use client';

import { useState, useEffect } from 'react';
import { FlightBooking } from './FlightSearch'; // Import FlightBooking
import { HotelDetailsProps } from './HotelDetails'; // Import HotelDetailsProps


export default function Cart() {
  const [flights, setFlights] = useState<FlightBooking[]>([]); // Explicitly typed
  const [hotels, setHotels] = useState<HotelDetailsProps[]>([]); // Explicitly typed
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem('token'); // Retrieve the token from LocalStorage

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

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={handleCartToggle}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
      >
        {isOpen ? 'Close Cart' : 'Open Cart'}
      </button>
      {isOpen && (
        <div className="mt-2 bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg max-w-sm">
          <h3 className="text-lg font-semibold mb-2">Your Cart</h3>
          <div>
            <h4 className="font-medium">Flights:</h4>
            {flights.length > 0 ? (
              <ul className="list-disc pl-5">
                {flights.map((flight: FlightBooking, index) => (
                  <li key={index}>
                    {flight.flightNumber} - {flight.originCity} ({flight.originCode}) to {flight.destinationCity} ({flight.destinationCode})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No flights in cart.</p>
            )}
          </div>
          <div className="mt-4">
            <h4 className="font-medium">Hotels:</h4>
            {hotels.length > 0 ? (
              <ul className="list-disc pl-5">
                {hotels.map((hotel: HotelDetailsProps, index) => (
                  <li key={index}>
                    {hotel.name} - {hotel.city}, {hotel.address}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hotels in cart.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
