import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userHeader = request.headers.get("x-user");
        
        if (!userHeader) {
            return NextResponse.json(
                { error: "Unauthorized - User not authenticated" },
                { status: 401 }
            );
        }

        // Parse the stringified user data
        const user = JSON.parse(userHeader);
        
        // Get hotel owner details
        const hotelOwner = await prisma.hotelOwner.findFirst({
            where: {
                userId: user.id
            }
        });
        
        if (!hotelOwner) {
            return NextResponse.json(
                { error: "Forbidden - User is not a hotel owner" },
                { status: 403 }
            );
        }

        // Get all hotels owned by the user
        const hotels = await prisma.hotel.findMany({
            where: {
                ownerId: hotelOwner.id
            },
            select: {
                id: true,
                name: true,
                city: true,
                address: true,
                starRating: true,
                logoUrl: true,
                imageUrls: true,
                _count: {
                    select: {
                        roomTypes: true,
                        hotelBookings: true
                    }
                }
            }
        });

        const hotelSummaries = hotels.map(hotel => ({
            id: hotel.id,
            name: hotel.name,
            city: hotel.city,
            address: hotel.address,
            starRating: hotel.starRating,
            logoUrl: hotel.logoUrl,
            imageUrls: hotel.imageUrls,
            totalRooms: hotel._count.roomTypes,
            activeBookings: hotel._count.hotelBookings
        }));

        return NextResponse.json(hotelSummaries, { status: 200 });

    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}


