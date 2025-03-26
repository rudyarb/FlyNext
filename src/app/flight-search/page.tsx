'use client'; // This marks the file as a client component
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
}

const FlightSearchPage = () => {
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setstartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [flights, setFlights] = useState<Flight[]>([]); // Adjusted type based on Flight interface
  const [isLoaded, setIsLoaded] = useState(false); // Flag to check when client-side has finished rendering

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
      console.log("Flight data:", data); // Debug: Check the response data
      setFlights(data); // Assuming the response matches the Flight interface
    } catch (error) {
      console.error("Error fetching flight data:", error);
      setFlights([]); // Reset flights on error
    }
  };

  useEffect(() => {
    setIsLoaded(true); // Set loaded flag to true after component mounts
  }, []); // Empty dependency array ensures it runs only once

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
            onChange={(e) => setstartDate(e.target.value)}
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
      
      {/* Only render the flight list after the component has mounted */}
      {isLoaded && flights.length > 0 ? (
        <div className="mt-8">
          <FlightList flights={flights} />
        </div>
      ) : (
        <p className="mt-8 text-center text-gray-500">No flights found. Try a different search.</p>
      )}
    </div>
  );
};

export default FlightSearchPage;
