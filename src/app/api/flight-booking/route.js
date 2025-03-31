import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getAFSFlights } from "@utils/helpers";

export async function POST(request) {
    // UNCOMMENT THIS SECTION WHEN AUTHENTICATION IS IMPLEMENTED
    // Extract user object from headers
    const userHeader = request.headers.get("x-user");

    // Check if the userHeader is missing or invalid
    if (!userHeader) {
        // console.log("User header is missing or empty");
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
        const body = await request.json();
        const {
            flightId,
            flightNumber,
            departureTime,
            originCode,
            originName,
            originCity,
            originCountry,
            arrivalTime,
            destinationCode,
            destinationName,
            destinationCity,
            destinationCountry,
            duration,
            price,
            currency,
            availableSeats,
            status,
            airlineName,
            passportNumber,
            email
        } = body;

        
        // // Checks to see that the userId provided is a legitimate user
        // const userId = "2e51126c-b69c-4fc8-8b82-e94e87ac7804";
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return new Response(
                JSON.stringify({ error: "User was not found!"}),
                { status: 404, headers: { "Content-Type": "application/json" } }
                );
        }

        // Proceed to booking process
        const AFS_API_KEY = "64a61055322c29c719f9ec0ae7ce7cbf6145316fa3001096c3fadc50a0582863";
        const url = "https://advanced-flights-system.replit.app/api/bookings";

        const bookingData = {
            email: email,
            firstName: user.firstName,
            lastName: user.lastName,
            passportNumber: passportNumber,
            flightId: [flightId]
        };
        
        try {
            // TODO verify booking placed
            await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': AFS_API_KEY, // API key for authentication
            },
            body: JSON.stringify(bookingData),
            });
            console.log("Placed flight booking!");
        } 
        catch (error) {
            return new Response(
                JSON.stringify({ error: "Something went wrong! Flight booking could not be made!"}),
                { status: 400, headers: { "Content-Type": "application/json" } }
              );
        }

        // Create FlightBooking entry in our local database
        const newFlightBooking = await prisma.flightBooking.create({
            data: {
                flightId,
                flightNumber,
                departureTime,
                originCode,
                originName,
                originCity,
                originCountry,
                arrivalTime,
                destinationCode,
                destinationName,
                destinationCity,
                destinationCountry,
                duration,
                price,
                currency,
                availableSeats,
                status,
                airlineName,
                userId,
                passportNumber,
                email
            }
        });

        // Return the newFlightBooking
        return new Response(
            JSON.stringify(newFlightBooking),
            { status: 201, headers: { "Content-Type": "application/json" } }
          );
    }
    catch (error) {
        // Deal with error
        console.log(error.message);
        return new Response(
            JSON.stringify({ error: "Something went wrong! Flight booking could not be made!"}),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
    }
}

export async function GET(request) {
    // UNCOMMENT THIS SECTION WHEN AUTHENTICATION IS IMPLEMENTED
    // Extract user object from headers
    const userHeader = request.headers.get("x-user");
    console.log("User header:", userHeader);

    // Check if the userHeader is missing or invalid
    if (!userHeader) {
        // console.log("User header is missing or empty");
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
        // Fetch all flight bookings for the user
        const flightBookings = await prisma.flightBooking.findMany({
            where: { userId , itinerary: null } // Only fetch bookings where itinerary is NULL},
        });

        // if (!flightBookings.length) {
        //     return new Response(
        //         JSON.stringify({ message: "No flight bookings found for this user" }),
        //         { status: 404, headers: { "Content-Type": "application/json" } }
        //     );
        // }

        return new Response(
            JSON.stringify(flightBookings),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching flight bookings:", error);
        return new Response(
            JSON.stringify({ error: "Something went wrong! Could not fetch flight bookings." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function DELETE(request) {
    // UNCOMMENT THIS SECTION WHEN AUTHENTICATION IS IMPLEMENTED
    // Extract user object from headers
    const userHeader = request.headers.get("x-user");
    console.log("User header:", userHeader);

    // Check if the userHeader is missing or invalid
    if (!userHeader) {
        // console.log("User header is missing or empty");
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
        const { flightBookingId } = await request.json();

        // Also delete from our DB
        await prisma.flightBooking.delete({
            where: { id: flightBookingId }
          });

        return new Response(
            JSON.stringify({ message: "The flight booking was cancelled successfully"}),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
    } 
    
    catch (error) {
        return new Response(
            JSON.stringify({ error: "Something went wrong! Flight booking could not be cancelled!"}),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
    }
  }

// Payload for testing POST:
// {
//     "flightId": "bd7ee4df-004d-4c95-abda-633d276a5842",
//     "flightNumber": "AC8762",
//     "departureTime": "2024-11-17T14:50:00.000Z",
//     "originCode": "YYZ",
//     "originName": "Toronto Pearson International Airport",
//     "originCity": "Toronto",
//     "originCountry": "Canada",
//     "arrivalTime": "2024-11-18T02:00:00.000Z",
//     "destinationCode": "ZRH",
//     "destinationName": "Zurich Airport",
//     "destinationCity": "Zurich",
//     "destinationCountry": "Switzerland",
//     "duration": 670,
//     "price": 1744,
//     "currency": "CAD",
//     "availableSeats": 131,
//     "status": "SCHEDULED",
//     "airlineName": "Air Canada",
//     "passportNumber": 123456789,
//     "email": roodydoody@gmail.com
//   }
