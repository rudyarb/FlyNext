import React from 'react';

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

interface FlightListProps {
  flights: Flight[];
}

const FlightList: React.FC<FlightListProps> = ({ flights }) => {
  console.log("Flights received:", flights); // Check if flights are passed
  return (
    <div>
      {flights.length === 0 ? (
        <p>No flights available</p>
      ) : (
        flights.map((flight) => (
          <div key={flight.id} className="border p-4 my-4 rounded">
            <h3 className="text-xl font-bold">{flight.flightNumber}</h3>
            <p>
              <strong>Airline:</strong> {flight.airline.name} ({flight.airline.code})
            </p>
            <p>
              <strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}
            </p>
            <p>
              <strong>Arrival:</strong> {new Date(flight.arrivalTime).toLocaleString()}
            </p>
            <p>
              <strong>From:</strong> {flight.origin.city}, {flight.origin.country} ({flight.origin.code})
            </p>
            <p>
              <strong>To:</strong> {flight.destination.city}, {flight.destination.country} ({flight.destination.code})
            </p>
            <p>
              <strong>Price:</strong> {flight.currency} {flight.price}
            </p>
            <p>
              <strong>Available Seats:</strong> {flight.availableSeats}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default FlightList;
