import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getAFSFlights } from "@utils/helpers";

export async function GET(request) {
    // UNCOMMENT WHEN DO AUTHORIZATION
    // Extract user object from headers
    const userHeader = request.headers.get("x-user");

    // Check if the userHeader is missing or invalid
    if (!userHeader) {
        console.log("User header is missing or empty");
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser;
    try {
        validatedUser = JSON.parse(userHeader); // Try to parse the header
        // console.log("Parsed user:", validatedUser);
    } catch (error) {
        // console.log("Error parsing user header:", error);
        return new Response(
            JSON.stringify({ error: "Invalid user data" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const userId = validatedUser.id; // Ensure ID is extracted correctly
    // console.log("User ID:", userId);

    // Ensure userId is valid
    if (!userId) {
        // console.log("User ID is invalid");
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }
    
    try {
        // const userId = "2e51126c-b69c-4fc8-8b82-e94e87ac7804";
        const url = new URL(request.url);
        const flightBookingId = url.searchParams.get('flightBookingId');

        // Get the flight booking from flightBookingId to see its status when booked
        const flightBooking = await prisma.flightBooking.findUnique({
            where: { id: flightBookingId },
          });

        // console.log(flightBooking);

        // Authenicate the user
        if (flightBooking.userId != userId) {
            return new Response(
                JSON.stringify({ error: "Unauthorized or Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
              );
        }

        if (!flightBooking) {
          return new Response(
            JSON.stringify({error: "We could not find this booking"}),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      
        // In the clear, the correct user is seeing this info
        // Make a request to the AFS API to get the specific flight details
        // Extract the UUID part of the flightId
        const flightId = flightBooking.flightId.split('_').pop();
        console.log("Extracted FlightId:", flightId);

        const afsResponse = await fetch(`https://advanced-flights-system.replit.app/api/flights/${flightId}`, {
            method: "GET",
            headers: {
                "x-api-key": "64a61055322c29c719f9ec0ae7ce7cbf6145316fa3001096c3fadc50a0582863", // Replace with the actual API key
                "Content-Type": "application/json"
            }
        });

        if (!afsResponse.ok) {
            return new Response(JSON.stringify({ error: "Failed to fetch flight details from AFS API" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const afsFlight = await afsResponse.json();

        // Compare the flightBooking status with the status from the AFS API
        if (afsFlight.status === "SCHEDULED" && flightBooking.status === "SCHEDULED") {
            return new Response(JSON.stringify({ message: "Your flight schedule has remained the same!" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            await prisma.flightBooking.update({
                where: { id: flightBooking.id }, // identify the record by its unique ID
                data: { status: "CANCELLED" }, // update the status
            });

            return new Response(JSON.stringify({ message: "Your flight schedule has been cancelled! Please refresh the page to see the reflected change and update your booking accordingly!" }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        
    }
    catch (error) {
        // console.log(error.message);
        return new Response(JSON.stringify({error: "Something went wrong! We were not able to verify the flight"}), {
            status: 400,
            headers: { "Content-Type": "application/json" },
            });
    }
}