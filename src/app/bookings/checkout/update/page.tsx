'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutUpdate() {
  const [flightBookings, setFlightBookings] = useState<any[]>([]);
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [creditCard, setCreditCard] = useState({ number: '', expiryMonth: '', expiryYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId'); // Extract bookingId from query params
  const token = localStorage.getItem("token"); // Get the token from local storage

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID is missing. Please go back and try again.');
      return;
    }

    // Fetch all flight and hotel bookings
    const fetchDetails = async () => {
      try {
        const flightRes = await fetch('/api/flight-booking', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Replace with actual user ID (after authentication)
            }
          }
        );
        const hotelRes = await fetch('/api/hotel-booking', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Replace with actual user ID (after authentication)
            }
          }
        );
        const flightData = await flightRes.json();
        const hotelData = await hotelRes.json();
        setFlightBookings(flightData);
        setHotelBookings(hotelData);
      } catch (err) {
        setError('Failed to load booking details.');
      }
    };
    fetchDetails();
  }, [bookingId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreditCard({ ...creditCard, [name]: value });
  };

  const updateBooking = async () => {
    if (!token) {
      console.log("No token found. Please log in.");
      return;
    }

    if (!bookingId) {
      setError('Booking ID is missing. Cannot update booking.');
      return;
    }

    setLoading(true);
    setError('');
    setBookingSuccess(false);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Replace with actual user ID
        },
        body: JSON.stringify({ creditCard }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message === "Credit card details invalid") {
          alert("Invalid credit card details. Please check and try again.");
          return;
        }
        alert(errorData.error || "Failed to update booking.");
        return;
      }

      const updatedBooking = await response.json();
      console.log('Booking updated successfully:', updatedBooking);

      // Update flight and hotel bookings with the updated itinerary details
      if (updatedBooking.itinerary) {
        setFlightBookings(updatedBooking.itinerary.flights || []);
        setHotelBookings(updatedBooking.itinerary.hotels || []);
      }

      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "An unknown error occurred.");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout Page</h1>
      {error && <p className="text-red-500">{error}</p>}

      {flightBookings.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Flight Bookings</h2>
          {flightBookings.map((flight, index) => (
            <div key={index} className="border p-2 mb-2">
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
            <div key={index} className="border p-2 mb-2">
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
        onClick={updateBooking}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading || bookingSuccess}
      >
        {loading ? 'Updating...' : bookingSuccess ? 'Booking Updated' : 'Update Booking'}
      </button>

      {bookingSuccess && (
        <p className="text-green-500 mt-4">
          Your booking has been updated successfully! Please go to "My Bookings" to see it!
        </p>
      )}

      {/* <Link href="/bookings" className="block mt-4 text-blue-600">
        All Your Bookings
      </Link> */}
    </div>
  );
}
