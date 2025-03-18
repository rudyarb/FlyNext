import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getAFSFlights } from "@utils/helpers";

export async function GET(request) {
    try {
        // Based on request specifics, extract data
        const { searchParams } = new URL(request.url);
        const source = searchParams.get("source");
        const destination = searchParams.get("destination");
        const startDate = searchParams.get("startDate");
        const returnDate = searchParams.get("returnDate");
        let startFlights = null;
        let returnFlights = null;

        const citySourceResult = await prisma.city.findFirst({
            where: {
              city: source
            }
          });
          
        const airportSourceResult = await prisma.airport.findFirst({
            where: {
              code: source
            }
          });

        const cityDestResult = await prisma.city.findFirst({
            where: {
              city: destination
            }
          });
          
        const airportDestResult = await prisma.airport.findFirst({
            where: {
              code: destination
            }
          });

        if (!(citySourceResult || airportSourceResult)) {
            return new Response(
                JSON.stringify(`${source} is not in our database of cities and airports`),
                { status: 400, headers: { "Content-Type": "application/json" } }
              );
        }

        if (!(cityDestResult || airportDestResult)) {
            return new Response(
                JSON.stringify(`${destination} is not in our database of cities and airports`),
                { status: 400, headers: { "Content-Type": "application/json" } }
              );
        }

        if (!returnDate) {  // means that the flight is one way
            startFlights = await getAFSFlights(source, destination, startDate);
            return new Response(
                JSON.stringify({ startFlights }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
        }
        else {  // round trip flight
            startFlights = await getAFSFlights(source, destination, startDate);
            returnFlights = await getAFSFlights(destination, source, returnDate);
            return new Response(
                JSON.stringify({ startFlights, returnFlights }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
        }
    }
    catch (error) {
        // Deal with error
        return new Response(
            JSON.stringify({ error: "Something went wrong! Flights could not be found!"}),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
    }
}

export async function POST(request) {
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

        // Checks to see that the userId provided is a legitimate user
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
  