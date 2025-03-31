import React from 'react';

export interface Flight {
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

export interface FlightBooking {
  id: string;
  flightId: string;
  flightNumber: string;
  departureTime: string;
  originCode: string;
  originName: string;
  originCity: string;
  originCountry: string;
  arrivalTime: string;
  destinationCode: string;
  destinationName: string;
  destinationCity: string;
  destinationCountry: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  status: string;
  airlineName: string | null;
}

export interface HotelBooking {
  name: string;
  location: string;
  pricePerNight: number;
}

interface FlightListProps {
  flights: Flight[];
  onBookFlight: (flight: Flight) => void;
}

const FlightList: React.FC<FlightListProps> = ({ flights, onBookFlight }) => {
  return (
    <div>
      {flights.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No flights available</p>
      ) : (
        flights.map((flight) => (
          <div key={flight.id} className="border border-gray-200 dark:border-gray-700 p-4 my-4 rounded bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{flight.flightNumber}</h3>
            <div className="text-gray-700 dark:text-gray-300">
              <p>
                <strong>Airline:</strong> {flight.airline.name}
              </p>
              <p>
                <strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}
              </p>
              <p>
                <strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}
              </p>
              <p>
                <strong>From:</strong> {flight.origin.city}, {flight.origin.country}
              </p>
              <p>
                <strong>To:</strong> {flight.destination.city}, {flight.destination.country}
              </p>
              <p>
                <strong>Price:</strong> {flight.currency} {flight.price}
              </p>
              <p>
                <strong>Available Seats:</strong> {flight.availableSeats}
              </p>
              <p>
                <strong>Duration:</strong> {flight.duration} minutes
              </p>
              <p>
                <strong>Status:</strong> {flight.status}
              </p>
            </div>
            <button
              onClick={() => onBookFlight(flight)}
              className="mt-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600"
            >
              Book Flight
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default FlightList;
