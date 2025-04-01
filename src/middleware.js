import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@utils/auth";  // Adjust path if needed

export async function middleware(req) {
  
  // Verify user with access token
  const verifiedUser = await verifyToken(req);
  
  // Additional check in case response is null
  if (!verifiedUser) {
      return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
      );
  }

  // OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com/
  // Process and return response
  const response =  NextResponse.next();
  response.headers.set("x-user", JSON.stringify(verifiedUser));
  return response;
}

// OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com/
// Apply middleware only to API routes
export const config = {
    matcher: [
        "/api/users/profile",
        "/api/bookings",
        "/api/bookings/:checkout",
        "/api/bookings/:invoice",
        "/api/bookings/:verify-flight",
        "/api/flight-search",
        "/api/flight-booking",
        "/api/hotel-booking",
        "/api/hotels/info/:hotelId/bookings",
        "/api/hotels/info/:hotelId/bookings/availability",
        "/api/hotels/manage",
        "/api/hotels/manage/:hotelId",
        "/api/hotels/manage/:hotelId/room",
        "/api/hotels/manage/:hotelId/room/:roomId",
        "/api/notifications",
    ], // Runs for all /api routes
};
