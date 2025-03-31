"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { FlightBooking, HotelBooking } from "../components/FlightSearch"

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Initialize useRouter

    const verifyFlight = async (flightBookingId: string) => {
        try {
            const response = await fetch(`/api/bookings/verify-flight?flightBookingId=${flightBookingId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "x-user": JSON.stringify({ id: "user-id-placeholder" }) // Replace with actual user ID
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
            } else {
                alert(data.error || "Failed to verify flight.");
            }
        } catch (error) {
            console.error("Error verifying flight:", error);
            alert("An error occurred while verifying the flight.");
        }
    };

    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await fetch("/api/bookings");
                if (!response.ok) {
                    throw new Error("Failed to fetch bookings");
                }
                const bookingsData = await response.json();
                setBookings(bookingsData);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchBookings();
    }, []);

    if (loading) {
        return <p>Loading bookings...</p>;
    }

    return (
        <div className="flex flex-col items-center text-gray-800 dark:text-white">
            <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>

            <button
                onClick={() => router.push("/")}
                className="mb-6 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                Go Back to Home
            </button>

            {bookings.length > 0 ? (
                bookings.map((booking, bookingIndex) => (
                    <div key={bookingIndex} className="mb-6 border border-gray-200 dark:border-gray-700 p-4 w-full max-w-3xl bg-white dark:bg-gray-800">
                        <h2 className="text-xl font-semibold mb-2">
                            Booking ID: {booking.id || "N/A"}
                        </h2>

                        {booking.itinerary?.flights?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">Flight Bookings</h3>
                                {booking.itinerary.flights.map((flightBooking: FlightBooking, index: number) => (
                                    <div key={index} className="border p-2 mb-2">
                                        <p>Flight Number: {flightBooking.flightNumber}</p>
                                        <p>Departure Time: {flightBooking.departureTime}</p>
                                        <p>Origin Code: {flightBooking.originCode}</p>
                                        <p>Origin Name: {flightBooking.originName}</p>
                                        <p>Origin City: {flightBooking.originCity}</p>
                                        <p>Origin Country: {flightBooking.originCountry}</p>
                                        <p>Arrival Time: {flightBooking.arrivalTime}</p>
                                        <p>Destination Code: {flightBooking.destinationCode}</p>
                                        <p>Destination Name: {flightBooking.destinationName}</p>
                                        <p>Destination City: {flightBooking.destinationCity}</p>
                                        <p>Destination Country: {flightBooking.destinationCountry}</p>
                                        <p>Duration: {flightBooking.duration} minutes</p>
                                        <p>Price: {flightBooking.price} {flightBooking.currency}</p>
                                        <p>Available Seats: {flightBooking.availableSeats}</p>
                                        <p>Status: {flightBooking.status}</p>
                                        <p>Airline: {flightBooking.airlineName || 'N/A'}</p>

                                        <button
                                            onClick={() => verifyFlight(flightBooking.id)}
                                            className="mt-2 px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 dark:hover:bg-yellow-600"
                                        >
                                            Verify Flight
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {booking.itinerary?.hotels?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">Hotel Bookings</h3>
                                {booking.itinerary.hotels.map((hotelBooking: HotelBooking, index: number) => (
                                    <div key={index} className="border p-2 mb-2">
                                        <p>Hotel Name: {hotelBooking.name}</p>
                                        <p>Location: {hotelBooking.location}</p>
                                        <p>Price per night: {hotelBooking.pricePerNight}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(!booking.itinerary?.flights?.length && !booking.itinerary?.hotels?.length) && (
                            <p>No bookings found for this itinerary.</p>
                        )}

                        <button
                            onClick={() => router.push("/flight-search")}
                            className="mt-4 px-4 py-2 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 dark:hover:bg-green-600"
                        >
                            Modify
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-gray-600 dark:text-gray-300">No bookings found.</p>
            )}
        </div>
    );
}
