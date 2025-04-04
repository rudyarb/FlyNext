'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Checkout() {
  const [flightBookings, setFlightBookings] = useState<any[]>([]);
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [creditCard, setCreditCard] = useState({ number: '', expiryMonth: '', expiryYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Move localStorage access to useEffect
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    // Only fetch if we have a token
    if (!token) return;

    const fetchDetails = async () => {
      try {
        const flightRes = await fetch('/api/flight-booking', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const hotelRes = await fetch('/api/hotel-booking', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const flightData = await flightRes.json();
        const hotelData = await hotelRes.json();
        setFlightBookings(flightData);
        setHotelBookings(hotelData);
      } catch (err) {
        setError('Failed to load booking details.');
      }
    };

    fetchDetails();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreditCard({ ...creditCard, [name]: value });
  };

  const finalizeBooking = async () => {
    if (!token) {
      console.log("No token found. Please log in.");
      return;
    }

    setLoading(true);
    setError('');
    setBookingSuccess(false);

    try {
      const response = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ creditCard }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to finalize booking.");
        return;
      }

      const data = await response.json();
      console.log('Booking successful:', data);
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to finalize booking. Please try again.");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 text-gray-800 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Checkout Page</h1>
      {error && <p className="text-red-500">{error}</p>}

      {flightBookings.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Flight Bookings</h2>
          {flightBookings.map((flight, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 p-2 mb-2 bg-white dark:bg-gray-800">
              <p>Flight Number: {flight.flightNumber}</p>
              <p>Departure Time: {flight.departureTime}</p>
              <p>Origin Code: {flight.originCode}</p>
              <p>Origin Name: {flight.originName}</p>
              <p>Origin City: {flight.originCity}</p>
              <p>Origin Country: {flight.originCountry}</p>
              <p>Arrival Time: {flight.arrivalTime}</p>
              <p>Destination Code: {flight.destinationCode}</p>
              <p>Destination Name: {flight.destinationName}</p>
              <p>Destination City: {flight.destinationCity}</p>
              <p>Destination Country: {flight.destinationCountry}</p>
              <p>Duration: {flight.duration} minutes</p>
              <p>Price: {flight.price} {flight.currency}</p>
              <p>Available Seats: {flight.availableSeats}</p>
              <p>Status: {flight.status}</p>
              <p>Airline: {flight.airlineName || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}

      {hotelBookings.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Hotel Bookings</h2>
          {hotelBookings.map((hotel, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 p-2 mb-2 bg-white dark:bg-gray-800">
              <p>Hotel Name: {hotel.name}</p>
              <p>Location: {hotel.location}</p>
              <p>Price per night: {hotel.pricePerNight}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Credit Card Information</h2>
        <input
          type="text"
          name="number"
          value={creditCard.number}
          onChange={handleInputChange}
          placeholder="Card Number"
          className="border border-gray-200 dark:border-gray-700 p-2 mb-2 block w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <input
          type="text"
          name="expiryMonth"
          value={creditCard.expiryMonth}
          onChange={handleInputChange}
          placeholder="Expiry Month"
          className="border border-gray-200 dark:border-gray-700 p-2 mb-2 block w-full bg-white dark:bg-gray-800"
        />
        <input
          type="text"
          name="expiryYear"
          value={creditCard.expiryYear}
          onChange={handleInputChange}
          placeholder="Expiry Year"
          className="border border-gray-200 dark:border-gray-700 p-2 mb-2 block w-full bg-white dark:bg-gray-800"
        />
      </div>

      <button
        onClick={finalizeBooking}
        className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-700"
        disabled={loading || bookingSuccess}
      >
        {loading ? 'Finalizing...' : bookingSuccess ? 'Booking Successful' : 'Finalize Booking'}
      </button>

      {bookingSuccess && (
        <p className="text-green-500 mt-4">
          Your booking has been placed successfully! Please go to "My Bookings" to see it!
        </p>
      )}

      {/* <Link href="/bookings" className="block mt-4 text-blue-600 dark:text-blue-400 hover:underline">
        All Your Bookings
      </Link> */}
    </div>
  );
}
