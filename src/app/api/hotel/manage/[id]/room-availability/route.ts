import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const isAuthorized = await verifyHotelOwner(request, id);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const roomType = searchParams.get('roomType');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startDate = searchParams.get('startDate') || today.toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || tomorrow.toISOString().split('T')[0];

    let whereClause: any = { hotelId: id };

    if (roomType) {
      whereClause.type = roomType;
    }

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
              { checkInDate: { lte: new Date(endDate), gte: new Date(startDate) } },
              { checkOutDate: { lte: new Date(endDate), gte: new Date(startDate) } },
            ],
            NOT: { status: "CANCELLED" },
          },
        } : false,
      },
    });

    const availability = roomTypes.map(roomType => {
      const totalRooms = roomType.quantity;
      const bookedRooms = startDate && endDate ? roomType.hotelBookings?.length || 0 : 0;

      return {
        id: roomType.id,
        type: roomType.type,
        totalRooms,
        availableRooms: totalRooms - bookedRooms,
        occupiedRooms: bookedRooms,
        currentAvailability: roomType.availability,
      };
    });

    return NextResponse.json({ roomTypeAvailability: availability });
  } catch (error) {
    console.error('Error fetching room availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room availability' },
      { status: 500 }
    );
  }
}


