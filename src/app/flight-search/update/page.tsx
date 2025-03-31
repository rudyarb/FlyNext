'use client';
import { useState, useEffect } from "react";
import React from 'react';
import FlightList from '../../components/FlightSearch'; // Corrected import path
import { Flight } from '../../components/FlightSearch'; // Corrected import path
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

const FlightSearchUpdatePage = () => {
  const [isClient, setIsClient] = useState(false);
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [startFlights, setStartFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId'); // Extract bookingId from query params

  useEffect(() => {
    setIsClient(true); // Ensure rendering happens only on the client
    setIsLoaded(true); // Mark the component as loaded
  }, []);

  if (!isClient) {
    return null; // Prevent rendering on the server
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const query = new URLSearchParams({
      source,
      destination,
      startDate,
      returnDate,
    }).toString();

    try {
      const response = await fetch(`/api/flight-search?${query}`);

      if (!response.ok) {
        const data = await response.json();
        alert(`Error: ${data.message || "Failed to fetch flights."}`);
        return;
      }

      const data = await response.json();

      console.log("Flight data:", data);

      // Separate setting of start and return flights with unique keys
      setStartFlights(
        data.startFlights?.results?.flatMap((group: any, groupIndex: number) =>
          group.flights.map((flight: any, flightIndex: number) => ({
            ...flight,
            id: `start-${groupIndex}-${flightIndex}-${flight.id}`,
            duration: flight.duration, // Include duration
            status: flight.status, // Include status
          }))
        ) || []
      );

      setReturnFlights(
        data.returnFlights?.results?.flatMap((group: any, groupIndex: number) =>
          group.flights.map((flight: any, flightIndex: number) => ({
            ...flight,
            id: `return-${groupIndex}-${flightIndex}-${flight.id}`,
            duration: flight.duration, // Include duration
            status: flight.status, // Include status
          }))
        ) || []
      );
    } catch (error) {
      console.error("Error fetching flight data:", error);
      setStartFlights([]);
      setReturnFlights([]);
    }
  };

  const handleBookFlight = async (flight: Flight) => {
    try {
      const response = await fetch('/api/flight-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': JSON.stringify({ id: "be30c455-0f69-40b7-a16c-085b73075b38" }), // Replace with actual user ID (after authentication)
        },
        body: JSON.stringify({
          flightId: flight.id,
          flightNumber: flight.flightNumber,
          departureTime: flight.departureTime,
          originCode: flight.origin.code,
          originName: flight.origin.name,
          originCity: flight.origin.city,
          originCountry: flight.origin.country,
          arrivalTime: flight.arrivalTime,
          destinationCode: flight.destination.code,
          destinationName: flight.destination.name,
          destinationCity: flight.destination.city,
          destinationCountry: flight.destination.country,
          duration: flight.duration, // Replace with actual duration if available
          price: flight.price,
          currency: flight.currency,
          availableSeats: flight.availableSeats,
          status: flight.status, // Replace with actual status if available
          airlineName: flight.airline.name,
          passportNumber: "passport-placeholder", // Replace with actual passport number
          email: "rudydoody@gmail.com", // Replace with actual email
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to book flight: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Flight booked successfully:", data);
      alert("Flight booked successfully!");
    } catch (error) {
      console.error("Error booking flight:", error);
      alert("Failed to book flight. Please try again.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow-lg rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Flight Search</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="source" className="block text-sm font-medium">Source</label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter source"
          />
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium">Destination</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter destination"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium">Departure Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium">Return Date</label>
          <input
            type="date"
            id="returnDate"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md w-full"
        >
          Search Flights
        </button>
      </form>

      {isLoaded && (startFlights.length > 0 || returnFlights.length > 0) ? (
        <div className="mt-8">
          <h3 className="text-xl font-semibold">Start Flights</h3>
          <FlightList
            flights={startFlights}
            onBookFlight={handleBookFlight}
          />
          <h3 className="text-xl font-semibold mt-4">Return Flights</h3>
          <FlightList
            flights={returnFlights}
            onBookFlight={handleBookFlight}
          />
        </div>
      ) : (
        <p className="mt-8 text-center text-gray-500">No flights found. Try a different search.</p>
      )}

      <div className="mt-8 text-center">
        {bookingId ? (
          <Link
            href={`/bookings/checkout/update?bookingId=${bookingId}`} // Pass bookingId as query param
            className="text-blue-600 underline"
          >
            Proceed to Checkout
          </Link>
        ) : (
          <p className="text-red-500">Booking ID is missing. Cannot proceed to checkout.</p>
        )}
      </div>
    </div>
  );
};

export default FlightSearchUpdatePage;
