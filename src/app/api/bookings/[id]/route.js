import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { validateCreditCard } from '@utils/helpers';

export async function PUT(request, { params }) {
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
        const { id: bookingId } = await params;
        const body = await request.json();
        const { creditCard } = body;
    
        if (validateCreditCard(creditCard.number, creditCard.expiryMonth, creditCard.expiryYear)) {

          // Find the itinerary associated with this booking
          const itineraryToUpdate = await prisma.itinerary.findUnique({
            where: { bookingId: bookingId }, // Ensure itinerary for this specific booking
            include: { flights: true, hotels: true }
          });

          // Clear itinerary of all of existing flights and hotels (need to do)
          await prisma.flightBooking.deleteMany({
            where: { 
              userId: userId,
              itineraryId: itineraryToUpdate.id
            }
          });

          await prisma.hotelBooking.deleteMany({
            where: { 
              userId: userId,
              itineraryId: itineraryToUpdate.id 
            }
          });

          // Get updated flights and hotel bookings (will have null itinerary bc not associated with one yet)
          const updatedFlightBookings = await prisma.flightBooking.findMany({
            where: {
              userId: userId,
              itineraryId: null, // itinerary is not set
            },
          });

          const updatedHotelBookings = await prisma.hotelBooking.findMany({
              where: {
                userId: userId,
                itineraryId: null, // itinerary is not set
              },
          });

          const updatedData = {};
          if (updatedFlightBookings) {
            updatedData.flights = { set: updatedFlightBookings };
          }
          if (updatedHotelBookings) {
            updatedData.hotels = { set: updatedHotelBookings };
          }
          
          // Update itinerary with new details
          await prisma.itinerary.update({
            where: { id: itineraryToUpdate.id },
            data: updatedData,
            include: {
              flights: true,
              hotels: true,
            }
          });

          // Find booking with updated itinerary to return
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId }, // Find the booking by ID
            include: {
              itinerary: {
                include: {
                  flights: true, // Include flights within itinerary
                  hotels: true,  // Include hotels within itinerary
                },
              }
            }
          });

          return new Response(
              JSON.stringify(booking),
              { status: 201, headers: { "Content-Type": "application/json" } }
              );
        }
        else {
          return new Response({message: "Credit card details invalid"}, {
            status: 400,
            headers: { "Content-Type": "application/json" },
            });
        }
    }
    catch (error) {
      return new Response(
          JSON.stringify({error: "Booking was not found from <id>"}),
          { status: 404, headers: { "Content-Type": "application/json" } }
          );
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

export async function DELETE(request, { params }) {
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
      const { id: bookingId } = await params;
  
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED", // Update the booking's status
          itinerary: {
            update: {
              status: "CANCELLED", // Update the itinerary's status
            }
          }
        },
        include: { itinerary: true } // Optionally include the updated itinerary
      });
    
      return new Response(
          JSON.stringify({ message: "Booking cancelled successfully!" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
          );
  }
  catch (error) {
      return new Response(
          JSON.stringify({ error: "Something went wrong! We could not cancel the booking." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
          );
  }
}
