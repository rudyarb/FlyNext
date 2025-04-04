import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await the params
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');

        if (!checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'Check-in and check-out dates are required' },
                { status: 400 }
            );
        }

        // Get all room types for this hotel
        const roomTypes = await prisma.roomType.findMany({
            where: {
                hotelId: id,
            },
            include: {
                hotelBookings: {
                    where: {
                        AND: [
                            { checkInDate: { lte: new Date(checkOut) } },
                            { checkOutDate: { gte: new Date(checkIn) } },
                            { status: "CONFIRMED" }
                        ]
                    }
                }
            }
        });

        const availability = roomTypes.map(roomType => ({
            id: roomType.id,
            type: roomType.type,
            amenities: roomType.amenities,
            pricePerNight: roomType.pricePerNight,
            imagesUrls: roomType.imageUrls,
            availableRooms: Math.max(0, roomType.quantity - roomType.hotelBookings.length),
            totalRooms: roomType.quantity
        }));

        return NextResponse.json(
            { availability },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching room availability:', error);
        return NextResponse.json(
            { error: 'Failed to fetch room availability' },
            { status: 500 }
        );
    }
}