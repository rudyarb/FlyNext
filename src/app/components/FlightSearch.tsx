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

interface FlightListProps {
  flights: Flight[];
  onBookFlight: (flight: Flight) => void;
}

const FlightList: React.FC<FlightListProps> = ({ flights, onBookFlight }) => {
  return (
    <div>
      {flights.length === 0 ? (
        <p>No flights available</p>
      ) : (
        flights.map((flight) => (
          <div key={flight.id} className="border p-4 my-4 rounded">
            <h3 className="text-xl font-bold">{flight.flightNumber}</h3>
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
            <button
              onClick={() => onBookFlight(flight)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md"
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
