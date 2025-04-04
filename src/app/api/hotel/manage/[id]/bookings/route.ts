import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { prisma } from "@utils/db";
import { getHotelOwnerId, ownsHotel } from "@utils/helpers";

async function verifyHotelOwner(request: NextRequest, hotelId: string): Promise<boolean> {
  const userHeader = request.headers.get("x-user");
  if (!userHeader) return false;

  try {
    const validatedUser = JSON.parse(userHeader);
    const userId = validatedUser.id;
    if (!userId) return false;

    const hotelOwnerId = await getHotelOwnerId(userId);
    if (!hotelOwnerId) return false;

    return await ownsHotel(hotelOwnerId, hotelId);
  } catch (error) {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hotelId } = await params;

  try {
    const isAuthorized = await verifyHotelOwner(request, hotelId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const roomType = searchParams.get('roomType');

    let whereClause: any = { hotelId };

    if (startDate || endDate) {
      whereClause.OR = [
        {
          checkInDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
        {
          checkOutDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      ];
    }

    if (roomType) {
      whereClause.roomType = { type: roomType };
    }

    const bookings = await prisma.hotelBooking.findMany({
      where: whereClause,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        roomType: { select: { type: true, pricePerNight: true } },
      },
      orderBy: { checkInDate: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: hotelId } = await params;

  try {
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validatedUser = JSON.parse(userHeader);
    const userId = validatedUser.id;

    if (!userId) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    const body = await request.json();
    const { roomTypeId, checkInDate, checkOutDate } = body;

    if (!roomTypeId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();

    if (checkIn < now || checkOut <= checkIn) {
      return NextResponse.json(
        { error: "Invalid dates" },
        { status: 400 }
      );
    }

    const roomType = await prisma.roomType.findFirst({
      where: { id: roomTypeId, hotelId },
      include: {
        hotel: true,
        hotelBookings: {
          where: {
            status: "CONFIRMED",
            OR: [
              { checkInDate: { lte: checkOut, gte: checkIn } },
              { checkOutDate: { lte: checkOut, gte: checkIn } },
            ],
          },
        },
      },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    const bookedRooms = roomType.hotelBookings.length;
    if (bookedRooms >= roomType.quantity) {
      return NextResponse.json(
        { error: "No rooms available for selected dates" },
        { status: 400 }
      );
    }

    const booking = await prisma.hotelBooking.create({
      data: {
        hotelId,
        roomId: roomTypeId,
        userId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        status: "CONFIRMED",
      },
      include: {
        hotel: true,
        roomType: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: {
          id: booking.id,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status,
          hotel: { id: booking.hotel.id, name: booking.hotel.name },
          roomType: { id: booking.roomType.id, type: booking.roomType.type },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: hotelId } = await Promise.resolve(params);

  try {
    const { bookingId } = await request.json();

    // Verify hotel owner
    const isAuthorized = await verifyHotelOwner(request, hotelId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Update booking status to CANCELLED
    await prisma.hotelBooking.update({
      where: {
        id: bookingId,
        hotelId: hotelId
      },
      data: {
        status: 'CANCELLED'
      }
    });

    return NextResponse.json({ message: 'Booking cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
