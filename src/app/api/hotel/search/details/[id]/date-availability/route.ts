import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    if (!params.id) {
        return NextResponse.json(
            { error: 'Hotel ID is required' },
            { status: 400 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');

        if (!checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'Check-in and check-out dates are required' },
                { status: 400 }
            );
        }

        const hotelId = params.id;

        // Get all room types for this hotel
        const roomTypes = await prisma.roomType.findMany({
            where: {
                hotelId: hotelId,
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

        // Calculate availability and format response
        const availability = roomTypes.map(roomType => {
            const bookedRoomsCount = roomType.hotelBookings.length;
            const availableRooms = Math.max(0, roomType.quantity - bookedRoomsCount);

            return {
                roomTypeId: roomType.id,
                type: roomType.type,
                amenities: roomType.amenities,
                pricePerNight: roomType.pricePerNight,
                images: roomType.images,
                availableRooms: availableRooms,
                totalRooms: roomType.quantity
            };
        });

        return NextResponse.json({ availability } as const,
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);

    } catch (error) {
        console.error('Error fetching room availability:', error);
        return NextResponse.json(
            { error: 'Failed to fetch room availability' },
            { status: 500 }
        );
    }
}