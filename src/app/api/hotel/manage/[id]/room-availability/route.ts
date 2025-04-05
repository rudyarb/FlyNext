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
            AND: [
              {
                OR: [
                  {
                    AND: [
                      { checkInDate: { lte: new Date(endDate) } },
                      { checkInDate: { gte: new Date(startDate) } }
                    ]
                  },
                  {
                    AND: [
                      { checkOutDate: { lte: new Date(endDate) } },
                      { checkOutDate: { gte: new Date(startDate) } }
                    ]
                  },
                  {
                    AND: [
                      { checkInDate: { lte: new Date(startDate) } },
                      { checkOutDate: { gte: new Date(endDate) } }
                    ]
                  }
                ]
              },
              { status: { not: "CANCELLED" } }
            ]
          }
        } : false,
      },
    });

    const availability = roomTypes.map(roomType => {
      const totalRooms = Math.max(0, roomType.quantity);
      let availableRooms = totalRooms;

      if (startDate && endDate && roomType.hotelBookings) {
        // Create array of dates in the range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateRange = [];
        let currentDate = new Date(start);

        while (currentDate <= end) {
          dateRange.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Count bookings for each date and find minimum availability
        const dailyAvailability = dateRange.map(date => {
          const bookingsOnDate = roomType.hotelBookings.filter(booking => {
            const bookingStart = new Date(booking.checkInDate);
            const bookingEnd = new Date(booking.checkOutDate);
            return date >= bookingStart && date <= bookingEnd;
          }).length;

          return Math.max(0, totalRooms - bookingsOnDate);
        });

        // Set available rooms to minimum availability across the date range
        availableRooms = Math.max(0, Math.min(...dailyAvailability));
      }

      const occupiedRooms = Math.max(0, totalRooms - availableRooms);

      return {
        id: roomType.id,
        type: roomType.type,
        totalRooms,
        availableRooms,
        occupiedRooms,
        currentAvailability: Math.max(0, roomType.availability),
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


