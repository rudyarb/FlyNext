'use client';
import { useState, useEffect, Suspense } from "react";
import React from 'react';
import FlightList from '../../components/FlightSearch'; // Corrected import path
import { Flight } from '../../components/FlightSearch'; // Corrected import path
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import Cart from '@/app/components/Cart';

const FlightSearchContent = () => {
  const [isClient, setIsClient] = useState(false);
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
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false); // Add this line
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId'); // Extract bookingId from query params
  const token = localStorage.getItem("token"); // Get the token from local storage

  useEffect(() => {
    setIsClient(true); // Ensure rendering happens only on the client
    setIsLoaded(true); // Mark the component as loaded
  }, []);

  if (!isClient) {
    return null; // Prevent rendering on the server
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true); // Add this line

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
        setError(data.message || "Failed to fetch flights."); // Replace alert with error state
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
      setError("An error occurred while fetching flights."); // Replace alert with error state
      setStartFlights([]);
      setReturnFlights([]);
    } finally {
      setIsSearching(false); // Add this line
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

  const loading = !isLoaded; // Define loading based on isLoaded

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <p className="text-gray-800 dark:text-gray-200">Loading flights...</p>
      </div>
    );
  }

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

      {isSearching && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-900 dark:text-gray-100 text-lg font-medium">Searching for flights...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {isLoaded && !isSearching && (startFlights.length > 0 || returnFlights.length > 0) ? (
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
      ) : !isSearching && (
        <p className="mt-8 text-center text-gray-500 dark:text-gray-400">No flights found. Try a different search.</p>
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-4">Enter Details</h3>
            <div className="mb-4">
              <label htmlFor="passportNumber" className="block text-sm font-medium">Passport Number</label>
              <input
                type="text"
                id="passportNumber"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <Cart />
    </div>
  );
};

const FlightSearchUpdatePage = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <p className="text-gray-800 dark:text-gray-200">Loading...</p>
      </div>
    }>
      <FlightSearchContent />
    </Suspense>
  );
};

export default FlightSearchUpdatePage;
