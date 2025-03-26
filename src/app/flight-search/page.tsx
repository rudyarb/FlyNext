'use client'; 
import { useState, useEffect } from "react";
import React from 'react';
import FlightList from '../components/FlightSearch';

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  price: number;
  currency: string;
  availableSeats: number;
  airline: {
    code: string;
    name: string;
  };
  duration: number; // Added duration
  status: string; // Added status
}

const FlightSearchPage = () => {
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [startFlights, setStartFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
        throw new Error(`API returned status ${response.status}`);
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
      const response = await fetch('/api/flight-search', {
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

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
            flights={startFlights.map(flight => ({
              ...flight,
              id: `start-${flight.id}`,
            }))}
            onBookFlight={handleBookFlight} // Pass the booking handler
          />
          <h3 className="text-xl font-semibold mt-4">Return Flights</h3>
          <FlightList
            flights={returnFlights.map(flight => ({
              ...flight,
              id: `return-${flight.id}`,
            }))}
            onBookFlight={handleBookFlight} // Pass the booking handler
          />
        </div>
      ) : (
        <p className="mt-8 text-center text-gray-500">No flights found. Try a different search.</p>
      )}
    </div>
  );
};

export default FlightSearchPage;
