"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { FlightBooking, HotelBooking } from "../components/FlightSearch";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null); // Use state for token
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        // Access localStorage only on the client side
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    const verifyFlight = async (flightBookingId: string) => {
        if (!token) {
            console.log("No token found. Please log in.");
            return;
        }

        try {
            const response = await fetch(`/api/bookings/verify-flight?flightBookingId=${flightBookingId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}` // Replace with actual user ID
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

    const deleteFlight = async (flightBookingId: string) => {
        if (!token) {
            console.log("No token found. Please log in.");
            return;
        }

        try {
            const response = await fetch(`/api/flight-booking`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}` // Replace with actual user ID
                },
                body: JSON.stringify({ flightBookingId })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.reload(); // Reload the bookings page
            } else {
                alert(data.error || "Failed to delete flight booking.");
            }
        } catch (error) {
            console.error("Error deleting flight booking:", error);
            alert("An error occurred while deleting the flight booking.");
        }
    };

    const deleteBooking = async (bookingId: string) => {
        if (!token) {
            console.log("No token found. Please log in.");
            return;
        }

        try {
            const response = await fetch(`/api/bookings`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}` // Replace with actual user ID
                },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.reload(); // Reload the bookings page
            } else {
                alert(data.error || "Failed to delete booking.");
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert("An error occurred while deleting the booking.");
        }
    };

    const generateInvoice = async (bookingId: string) => {
        if (!token) {
            console.log("No token found. Please log in.");
            return;
        }

        try {
            const response = await fetch(`/api/bookings/invoice?bookingId=${bookingId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}` // Replace with actual user ID
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `booking_${bookingId}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Failed to generate invoice.");
            }
        } catch (error) {
            console.error("Error generating invoice:", error);
            alert("An error occurred while generating the invoice.");
        }
    };

    useEffect(() => {
        async function fetchBookings() {
            if (!token) {
                console.log("No token found. Please log in.");
                return;
            }

            try {
                const response = await fetch('/api/bookings', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Replace with actual user ID
                    }
                });

                if (!response.ok) {
                    alert("Failed to fetch bookings.");
                    return;
                }
                const bookingsData = await response.json();
                setBookings(bookingsData);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                alert("An error occurred while fetching bookings.");
                return;
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            fetchBookings();
        }
    }, [token]); // Add token as a dependency

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

                                        <button
                                            onClick={() => deleteFlight(flightBooking.id)}
                                            className="mt-2 ml-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                                        >
                                            Delete Flight
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
                            <p>No itinerary was found for this booking.</p>
                        )}

                        <button
                            onClick={() => generateInvoice(booking.id)}
                            className="mt-4 mr-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                        >
                            Generate Invoice for Booking
                        </button>

                        <button
                            onClick={() => router.push(`/flight-search/update?bookingId=${booking.id}`)}
                            className="mt-4 ml-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                        >
                            Add Flight
                        </button>

                        <button
                            onClick={() => deleteBooking(booking.id)}
                            className="mt-4 ml-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                        >
                            Delete Booking
                        </button>
                    </div>
                ))
            ) : (
                <p className="text-gray-600 dark:text-gray-300">No bookings found.</p>
            )}
        </div>
    );
}
