'use client';

import React, { useEffect, useState } from 'react';

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: {
    city: string;
    country: string;
  };
  destination: {
    city: string;
    country: string;
  };
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  checkInDate: string;
  checkOutDate: string;
}

interface Booking {
  id: string;
  status: string;
  itinerary: {
    flights: Flight[];
    hotels: Hotel[];
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings', {
          headers: {
            'x-user': JSON.stringify({ id: 'be30c455-0f69-40b7-a16c-085b73075b38' }), // Replace with actual user ID
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        // setError(err.message || 'Error fetching bookings.');
        console.error(err);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>
      {error && <p className="text-red-500">{error}</p>}

      {bookings.length === 0 && !error ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="border p-4 mb-4 rounded shadow">
            <h2 className="text-xl font-semibold">Booking ID: {booking.id}</h2>
            <p>Status: {booking.status}</p>

            {booking.itinerary.flights.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Flights</h3>
                {booking.itinerary.flights.map((flight) => (
                  <div key={flight.id} className="border p-2 mb-2 rounded">
                    <p>Flight Number: {flight.flightNumber}</p>
                    <p>
                      From: {flight.origin.city}, {flight.origin.country}
                    </p>
                    <p>
                      To: {flight.destination.city}, {flight.destination.country}
                    </p>
                    <p>Departure: {new Date(flight.departureTime).toLocaleString()}</p>
                    <p>Arrival: {new Date(flight.arrivalTime).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {booking.itinerary.hotels.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Hotels</h3>
                {booking.itinerary.hotels.map((hotel) => (
                  <div key={hotel.id} className="border p-2 mb-2 rounded">
                    <p>Hotel Name: {hotel.name}</p>
                    <p>Location: {hotel.location}</p>
                    <p>Check-In: {new Date(hotel.checkInDate).toLocaleDateString()}</p>
                    <p>Check-Out: {new Date(hotel.checkOutDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
