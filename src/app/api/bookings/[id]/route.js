import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { validateCreditCard } from '@utils/helpers';

export async function PUT(request, { params }) {
    // UNCOMMENT after doing auth
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
    //   delete after doing auth
    //   const userId = "2e51126c-b69c-4fc8-8b82-e94e87ac7804";

      const { id: bookingId } = params;
      const body = await request.json();
      const { creditCard } = body;

      if (validateCreditCard(creditCard.number, creditCard.expiryMonth, creditCard.expiryYear)) {

          // Find the itinerary associated with this booking
          const itineraryToUpdate = await prisma.itinerary.findUnique({
              where: { bookingId: bookingId },
              include: { flights: true, hotels: true }
          });

          if (!itineraryToUpdate) {
              return new Response(
                  JSON.stringify({ error: "Itinerary not found for this booking" }),
                  { status: 404, headers: { "Content-Type": "application/json" } }
              );
          }

          // Get new flight bookings (not yet linked to an itinerary)
          const updatedFlightBookings = await prisma.flightBooking.findMany({
              where: {
                  userId: userId,
                  itineraryId: null, // Not yet associated with an itinerary
              },
              select: { id: true } // Only select IDs
          });

          // Get new hotel bookings (not yet linked to an itinerary)
          const updatedHotelBookings = await prisma.hotelBooking.findMany({
              where: {
                  userId: userId,
                  itineraryId: null, // Not yet associated with an itinerary
              },
              select: { id: true } // Only select IDs
          });

          const updatedData = {};
          if (updatedFlightBookings.length > 0) {
              updatedData.flights = { connect: updatedFlightBookings };
          }
          if (updatedHotelBookings.length > 0) {
              updatedData.hotels = { connect: updatedHotelBookings };
          }

          // Update itinerary with new flight/hotel bookings
          await prisma.itinerary.update({
              where: { id: itineraryToUpdate.id },
              data: updatedData,
              include: {
                  flights: true,
                  hotels: true,
              }
          });

          // Fetch updated booking with itinerary
          const booking = await prisma.booking.findUnique({
              where: { id: bookingId },
              include: {
                  itinerary: {
                      include: {
                          flights: true,
                          hotels: true,
                      },
                  }
              }
          });

          return new Response(
              JSON.stringify(booking),
              { status: 201, headers: { "Content-Type": "application/json" } }
          );
      } else {
          return new Response(
              JSON.stringify({ message: "Credit card details invalid" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
          );
      }
  } 
  catch (error) {
      return new Response(
          JSON.stringify({ error: "Booking was not found from <id>" }),
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
