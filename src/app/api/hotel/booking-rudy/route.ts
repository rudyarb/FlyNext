import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { getAFSFlights } from "@utils/helpers";

export async function GET(request) {
    // // UNCOMMENT THIS SECTION WHEN AUTHENTICATION IS IMPLEMENTED
    // // Extract user object from headers
    // const userHeader = request.headers.get("x-user");

    // // Check if the userHeader is missing or invalid
    // if (!userHeader) {
    //     // console.log("User header is missing or empty");
    //     return new Response(
    //         JSON.stringify({ error: "Unauthorized or Invalid token" }),
    //         { status: 401, headers: { "Content-Type": "application/json" } }
    //     );
    // }

    // let validatedUser;
    // try {
    //     validatedUser = JSON.parse(userHeader); // Try to parse the header
    //     // console.log("Parsed user:", validatedUser);
    // } catch (error) {
    //     // console.log("Error parsing user header:", error);
    //     return new Response(
    //         JSON.stringify({ error: "Invalid user data" }),
    //         { status: 401, headers: { "Content-Type": "application/json" } }
    //     );
    // }

    // const userId = validatedUser.id; // Ensure ID is extracted correctly
    // // console.log("User ID:", userId);

    // // Ensure userId is valid
    // if (!userId) {
    //     // console.log("User ID is invalid");
    //     return new Response(
    //         JSON.stringify({ error: "Unauthorized or Invalid token" }),
    //         { status: 401, headers: { "Content-Type": "application/json" } }
    //     );
    // }

    try {
        
        const userId = "2e51126c-b69c-4fc8-8b82-e94e87ac7804";
        // Fetch all flight bookings for the user
        const hotelBookings = await prisma.hotelBooking.findMany({
            where: { userId , itinerary: null } // Only fetch bookings where itinerary is NULL},
        });

        // if (!hotelBookings.length) {
        //     return new Response(
        //         JSON.stringify({ message: "No hotel bookings found for this user" }),
        //         { status: 404, headers: { "Content-Type": "application/json" } }
        //     );
        // }

        return new Response(
            JSON.stringify(hotelBookings),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching hotel bookings:", error);
        return new Response(
            JSON.stringify({ error: "Something went wrong! Could not fetch hotel bookings." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}
