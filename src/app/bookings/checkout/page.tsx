'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Checkout() {
  const [flightDetails, setFlightDetails] = useState<any>(null);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [creditCard, setCreditCard] = useState({ number: '', expiryMonth: '', expiryYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch selected flight and hotel details
    const fetchDetails = async () => {
      try {
        const flightRes = await fetch('/api/bookings/flight-details');
        const hotelRes = await fetch('/api/bookings/hotel-details');
        const flightData = await flightRes.json();
        const hotelData = await hotelRes.json();
        setFlightDetails(flightData);
        setHotelDetails(hotelData);
      } catch (err) {
        setError('Failed to load booking details.');
      }
    };
    fetchDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreditCard({ ...creditCard, [name]: value });
  };

  const finalizeBooking = async () => {
    setLoading(true);
    setError('');

    try {
      // Make the POST request with mock user data
      const response = await fetch('/api/bookings/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': JSON.stringify({ id: 123 }), // Mock user ID
        },
        body: JSON.stringify({ creditCard }),
      });

      if (!response.ok) {
        throw new Error('Failed to finalize booking');
      }

      alert('Booking successful! Invoice generated.');
      router.push('/bookings/confirmation');
    } catch (err) {
      setError('Error finalizing booking.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout Page</h1>
      {error && <p className="text-red-500">{error}</p>}

      {flightDetails && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Flight Details</h2>
          <p>Flight Number: {flightDetails.flightNumber}</p>
          <p>Airline: {flightDetails.airline}</p>
          <p>Price: {flightDetails.price}</p>
        </div>
      )}

      {hotelDetails && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Hotel Details</h2>
          <p>Hotel Name: {hotelDetails.name}</p>
          <p>Location: {hotelDetails.location}</p>
          <p>Price per night: {hotelDetails.pricePerNight}</p>
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
          className="border p-2 mb-2 block w-full"
        />
        <input
          type="text"
          name="expiryMonth"
          value={creditCard.expiryMonth}
          onChange={handleInputChange}
          placeholder="Expiry Month"
          className="border p-2 mb-2 block w-full"
        />
        <input
          type="text"
          name="expiryYear"
          value={creditCard.expiryYear}
          onChange={handleInputChange}
          placeholder="Expiry Year"
          className="border p-2 mb-2 block w-full"
        />
      </div>

      <button
        onClick={finalizeBooking}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Finalizing...' : 'Finalize Booking'}
      </button>

      {/* <Link href="/bookings" className="block mt-4 text-blue-600">
        Back to Bookings
      </Link> */}
    </div>
  );
}
