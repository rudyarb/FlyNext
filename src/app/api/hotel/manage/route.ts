import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getHotelOwnerId } from "@utils/helpers";

export async function GET(request: NextRequest) {
    try {
        // Get user session info (assuming user ID is passed in headers)
        const userId = request.headers.get("x-user");
        
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - User not authenticated" },
                { status: 401 }
            );
        }

        // Get hotel owner ID
        const hotelOwnerId = await getHotelOwnerId(userId);
        
        if (!hotelOwnerId) {
            return NextResponse.json(
                { error: "Forbidden - User is not a hotel owner" },
                { status: 403 }
            );
        }

        // Get all hotels owned by the user
        const hotels = await prisma.hotel.findMany({
            where: {
                ownerId: hotelOwnerId
            },
            include: {
                roomTypes: true
            }
        });

        return NextResponse.json(hotels, { status: 200 });

    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}


