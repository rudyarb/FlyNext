import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { validateCreditCard, sendNotification } from '@utils/helpers';

export async function POST(request) {
    // UNCOMMENT THIS AFTER DOING AUTHENTICATION
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
        // // DELETE this line after doing Authentication
        // const userId = "2e51126c-b69c-4fc8-8b82-e94e87ac7804";
        const body = await request.json();  // Payload
        const { creditCard } = body;

        if (validateCreditCard(creditCard.number, creditCard.expiryMonth, creditCard.expiryYear)) {
            // Change if DB changes!
            // Query to find flight and hotel bookings for this user
            const flightBookings = await prisma.flightBooking.findMany({
                where: {
                  userId: userId,
                  itineraryId: null, // itinerary is not set
                },
              });

            const hotelBookings = await prisma.hotelBooking.findMany({
                where: {
                  userId: userId,
                  itineraryId: null, // itinerary is not set
                },
              });  
            
            // Create new itinerary and pass in flights and hotels
            const newItinerary = await prisma.itinerary.create({
                data: {
                  status: "CONFIRMED",
                  flights: {
                    connect: flightBookings.map(flightBooking => ({ id: flightBooking.id }))
                  },
                  hotels: {
                    connect: hotelBookings.map(hotelBooking => ({ id: hotelBooking.id }))
                  }
                }
             });
            
            // Ensure to update the flight and hotel bookings that we just put
            // into the itinerary to link them with the itinerary we just created
            await prisma.flightBooking.updateMany({
                where: {
                  userId: userId,
                  itineraryId: null, // Only update bookings that aren't assigned yet
                },
                data: {
                  itineraryId: newItinerary.id,
                },
              });

            await prisma.hotelBooking.updateMany({
                where: {
                  userId: userId,
                  itineraryId: null, // Only update bookings that aren't assigned yet
                },
                data: {
                  itineraryId: newItinerary.id,
                },
              });

            // Finally create new booking using required fields
            const newBooking = await prisma.booking.create({
                data: {
                    status: "CONFIRMED",
                    itinerary: { connect: { id: newItinerary.id } },
                    userId: userId
                }
            });

            /// Link itinerary to booking
            await prisma.itinerary.update({
                where: { id: newItinerary.id },
                data: { bookingId: newBooking.id },
              });

            // Send notification to user
            await sendNotification(userId, "Itinerary confirmed (ID: " + newBooking.id + ")");

            return new Response(JSON.stringify(newBooking), {
                status: 201,
                headers: { "Content-Type": "application/json" },
                });
        }
        return new Response(JSON.stringify({message: "Credit card details invalid"}), {
            status: 400,
            headers: { "Content-Type": "application/json" },
            });
    }
    catch (error) {
        console.log(error.message);
        return new Response(JSON.stringify({ error: "Something went wrong, could not place booking. Try again later." }),
        {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// Payload for testing:
// {
//   "creditCard": {
//     "number": 4539578763621486,
//     "expiryMonth": 12,
//     "expiryYear": 2027
//   }
// }