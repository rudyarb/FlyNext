import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@utils/auth";  // Adjust path if needed

// Define interfaces for cleaner type declarations
interface VerifiedUser {
    id: string;
    email: string;
    role: string;
    [key: string]: any; // For any additional properties
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  
  // Verify user with access token
  const result = await verifyToken(req);
  
  // Check if result is a NextResponse (error case)
  if (result instanceof NextResponse) {
      return result;
  }
  
  const verifiedUser = result as VerifiedUser;
  if (!verifiedUser) {
      return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
      );
  }

  // OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com/
  // Process and return response
  const response: NextResponse = NextResponse.next();
  response.headers.set("x-user", JSON.stringify(verifiedUser));
  return response;
}

// OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com/
// Apply middleware only to API routes
export const config = {
    matcher: [
        "/api/bookings/:checkout",
        "/api/bookings/:invoice",
        "/api/bookings/:verify-flight",
        "/api/hotel-booking",
        "/api/hotels/info/:hotelId/bookings",
        "/api/hotels/info/:hotelId/bookings/availability",
        "/api/hotels/manage",
        "/api/hotels/manage/:hotelId",
        "/api/hotels/manage/:hotelId/room",
        "/api/hotels/manage/:hotelId/room/:roomId",

        // User related routes
        "/api/users/profile",
        
        // Booking related routes
        "/api/bookings",
        "/api/bookings/:path*",
        "/api/hotel/booking/create",
        "/api/hotel/booking/details",
        
        // Hotel management routes
        "/api/hotel/manage",
        "/api/hotel/manage/create-hotel",
        "/api/hotel/manage/:id",
        "/api/hotel/manage/:id/edit",
        "/api/hotel/manage/:id/bookings",
        "/api/hotel/manage/:id/create-roomtype",
        "/api/hotel/manage/:id/room-availability",
        
        // Notification routes
        "/api/notifications",
        
        // Flight related routes
        "/api/flight-booking",
        "/api/flight-search",
        
        // Protected hotel search features
        "/api/hotel/search/details/:id/date-availability"
    ]
};
