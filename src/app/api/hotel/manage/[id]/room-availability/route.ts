import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Verify hotel owner
    const isAuthorized = await verifyHotelOwner(request, params.id);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const roomType = searchParams.get('roomType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate dates if provided
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return NextResponse.json(
        { error: "Both startDate and endDate must be provided together" },
        { status: 400 }
      );
    }

    // Base query conditions
    let whereClause: any = {
      hotelId: params.id
    };

    // Add room type filter if provided
    if (roomType) {
      whereClause.type = roomType;
    }

    // Get room types with their bookings
    const roomTypes = await prisma.roomType.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        quantity: true,
        availability: true,
        hotelBookings: startDate && endDate ? {
          where: {
            OR: [
              {
                checkInDate: {
                  lte: new Date(endDate),
                  gte: new Date(startDate)
                }
              },
              {
                checkOutDate: {
                  lte: new Date(endDate),
                  gte: new Date(startDate)
                }
              }
            ],
            NOT: {
              status: "CANCELLED"
            }
          }
        } : false
      }
    });

    // Calculate availability for each room type
    const availability = roomTypes.map(roomType => {
      const totalRooms = roomType.quantity;
      const bookedRooms = startDate && endDate ? roomType.hotelBookings?.length || 0 : 0;

      return {
        id: roomType.id,
        type: roomType.type,
        totalRooms,
        availableRooms: totalRooms - bookedRooms,
        occupiedRooms: bookedRooms,
        currentAvailability: roomType.availability
      };
    });

    return NextResponse.json({ roomTypeAvailability: availability } as const,
		{ status: 200, headers: {'Content-Type': 'application/json'}});

  } catch (error) {
    console.error('Error fetching room availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room availability' },
      { status: 500 }
    );
  }
}


