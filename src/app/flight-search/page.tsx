'use client';
import { useState, useEffect } from "react";
import React from 'react';
import FlightList from '../components/FlightSearch';
import { Flight } from '../components/FlightSearch';
import Link from 'next/link';
import Cart from '@/app/components/Cart';

export default function FlightSearchPage() {
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [startFlights, setStartFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passportNumber, setPassportNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem("token"));
    setIsLoaded(true);
  }, []);

  if (!isClient) {
    return null;
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
            id: `start_${groupIndex}_${flightIndex}_${flight.id}`,
            duration: flight.duration, // Include duration
            status: flight.status, // Include status
          }))
        ) || []
      );

      setReturnFlights(
        data.returnFlights?.results?.flatMap((group: any, groupIndex: number) =>
          group.flights.map((flight: any, flightIndex: number) => ({
            ...flight,
            id: `return_${groupIndex}_${flightIndex}_${flight.id}`,
            duration: flight.duration, // Include duration
            status: flight.status, // Include status
          }))
        ) || []
      );
    } catch (error) {
      console.error("Error fetching flight data:", error);
      alert("An error occurred while fetching flights."); // Ensure alert is visible in dark mode
      setStartFlights([]);
      setReturnFlights([]);
    }
  };

  const handleBookFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowModal(true); // Show modal to collect user details
  };

  const handleConfirmBooking = async () => {
    if (!passportNumber || !email) {
      alert("Please enter both passport number and email.");
      return;
    }

    if (!token) {
      console.log("No token found. Please log in.");
      return;
    }

    try {
      const response = await fetch('/api/flight-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flightId: selectedFlight?.id,
          flightNumber: selectedFlight?.flightNumber,
          departureTime: selectedFlight?.departureTime,
          originCode: selectedFlight?.origin.code,
          originName: selectedFlight?.origin.name,
          originCity: selectedFlight?.origin.city,
          originCountry: selectedFlight?.origin.country,
          arrivalTime: selectedFlight?.arrivalTime,
          destinationCode: selectedFlight?.destination.code,
          destinationName: selectedFlight?.destination.name,
          destinationCity: selectedFlight?.destination.city,
          destinationCountry: selectedFlight?.destination.country,
          duration: selectedFlight?.duration,
          price: selectedFlight?.price,
          currency: selectedFlight?.currency,
          availableSeats: selectedFlight?.availableSeats,
          status: selectedFlight?.status,
          airlineName: selectedFlight?.airline.name,
          passportNumber,
          email,
        }),
      });

      if (!response.ok) {
        alert(`Failed to book flight: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log("Flight booked successfully:", data);
      alert("Flight booked successfully!");
      setShowModal(false); // Close modal
    } catch (error) {
      console.error("Error booking flight:", error);
      alert("Failed to book flight. Please try again.");
      return;
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-4 max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Flight Search</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Source</label>
            <input
              type="text"
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter source"
            />
          </div>
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Destination</label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter destination"
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Departure Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Return Date</label>
            <input
              type="date"
              id="returnDate"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md w-full hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Search Flights
          </button>
        </form>

        {isLoaded && (startFlights.length > 0 || returnFlights.length > 0) ? (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Start Flights</h3>
            <FlightList
              flights={startFlights}
              onBookFlight={handleBookFlight}
            />
            <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-white">Return Flights</h3>
            <FlightList
              flights={returnFlights}
              onBookFlight={handleBookFlight}
            />
          </div>
        ) : (
          <p className="mt-8 text-center text-gray-500 dark:text-gray-400">No flights found. Try a different search.</p>
        )}

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Enter Details</h3>
              <div className="mb-4">
                <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Passport Number
                </label>
                <input
                  type="text"
                  id="passportNumber"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/bookings/checkout" className="text-blue-600 dark:text-blue-400 hover:underline">
            Proceed to Checkout
          </Link>
          <br />
          <Link href="/hotel-search" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Search Hotels
          </Link>
        </div>
      </div>
      <Cart />
    </main>
  );
}
