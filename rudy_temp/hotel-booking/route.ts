import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { NextRequest, NextResponse } from "next/server"; // Assuming Next.js is used

// Define the structure of the validated user
interface ValidatedUser {
    id: string;
    [key: string]: any; // Allow additional properties if needed
}

// Define the structure of a hotel booking
interface HotelBooking {
    id: string;
    userId: string;
    itinerary: string | null;
    [key: string]: any; // Allow additional properties if needed
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    // Extract user object from headers
    const userHeader = request.headers.get("x-user");
    console.log("User header:", userHeader);

    // Check if the userHeader is missing or invalid
    if (!userHeader) {
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser: ValidatedUser;
    try {
        validatedUser = JSON.parse(userHeader); // Try to parse the header
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid user data" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const userId = validatedUser.id;

    // Ensure userId is valid
    if (!userId) {
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        // Fetch all hotel bookings for the user
        const rawHotelBookings = await prisma.hotelBooking.findMany({
            where: { userId, itinerary: null }, // Only fetch bookings where itinerary is NULL
        });

        // Map raw data to match the HotelBooking interface
        const hotelBookings: HotelBooking[] = rawHotelBookings.map((booking) => ({
            ...booking,
            itinerary: booking.itineraryId, // Map itineraryId to itinerary
        }));

        return new NextResponse(
            JSON.stringify(hotelBookings),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching hotel bookings:", error);
        return new NextResponse(
            JSON.stringify({ error: "Something went wrong! Could not fetch hotel bookings." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}
