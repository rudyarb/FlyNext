import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(request) {
    // // UNCOMMENT AFTER DOING AUTHENTICATION
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
        
        // TODO: Dispay itinerary details for user to view (frontend)
        // DELETE THIS LINE AFTER TESTING
        const userId = "2e51126c-b69c-4fc8-8b82-e94e87ac7804";
        console.log(userId);
  
        // Change if DB changes!
        const bookings = await prisma.booking.findMany({
          where: { userId: userId },
          include: {
            itinerary: {
                include: {
                    flights: true, 
                    hotels: true 
                }
            }
          }
        });
        console.log(bookings);
  
        return new Response(JSON.stringify(bookings), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
    } 
    catch (error) {
      return new Response({ error: "Something went wrong, could not get bookings. Try again later." },
      {
          status: 400,
          headers: { "Content-Type": "application/json" },
      });
    }
}