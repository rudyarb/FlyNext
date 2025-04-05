"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FlightBooking, HotelBooking } from "../components/FlightSearch";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check authentication status
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            router.push("users/login"); // Redirect to login if no token
            return;
        }
        setToken(storedToken);
    }, [router]);

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
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message); // Replace alert with success message
            } else {
                setErrorMessage(data.error || "Failed to verify flight."); // Replace alert with error message
            }
        } catch (error) {
            console.error("Error verifying flight:", error);
            setErrorMessage("An error occurred while verifying the flight."); // Replace alert with error message
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
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ flightBookingId })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message); // Replace alert with success message
                window.location.reload();
            } else {
                setErrorMessage(data.error || "Failed to delete flight booking."); // Replace alert with error message
            }
        } catch (error) {
            console.error("Error deleting flight booking:", error);
            setErrorMessage("An error occurred while deleting the flight booking."); // Replace alert with error message
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
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookingId })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message); // Replace alert with success message
                window.location.reload();
            } else {
                setErrorMessage(data.error || "Failed to delete booking."); // Replace alert with error message
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            setErrorMessage("An error occurred while deleting the booking."); // Replace alert with error message
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
                    'Authorization': `Bearer ${token}`
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
                setErrorMessage("Failed to generate invoice."); // Replace alert with error message
            }
        } catch (error) {
            console.error("Error generating invoice:", error);
            setErrorMessage("An error occurred while generating the invoice."); // Replace alert with error message
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
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    setErrorMessage("Failed to fetch bookings."); // Replace alert with error message
                    return;
                }
                const bookingsData = await response.json();
                setBookings(bookingsData);
            } catch (error) {
                console.error("Error fetching bookings:", error);
                setErrorMessage("An error occurred while fetching bookings."); // Replace alert with error message
                return;
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            fetchBookings();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
                <p className="text-gray-800 dark:text-gray-200">Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-4">
            <h1 className="text-2xl font-bold mb-4">Your Bookings</h1>

            <button
                onClick={() => router.push("/")}
                className="mb-6 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                Go Back to Home
            </button>

            {errorMessage && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-200 rounded-lg">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
                    {successMessage}
                </div>
            )}

            {bookings.length > 0 ? (
                bookings.map((booking, bookingIndex) => (
                    <div key={bookingIndex} className="mb-6 border border-gray-200 dark:border-gray-700 p-4 w-full max-w-3xl rounded-lg bg-white dark:bg-gray-800 shadow-md">
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
                                        <p>Hotel ID: {hotelBooking.hotelId}</p>
                                        <p>Room ID: {hotelBooking.roomId}</p>
                                        <p>Booking Status: {hotelBooking.status}</p>
                                        <p>Check-In Date: {hotelBooking.checkInDate}</p>
                                        <p>Check-Out Date: {hotelBooking.checkOutDate}</p>
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
