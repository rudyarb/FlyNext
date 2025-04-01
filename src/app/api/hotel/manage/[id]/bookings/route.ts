import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";
import { sendNotification, getUserIdByHotelOwnerId } from "@utils/helpers";

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

    // Base query conditions
    let whereClause: any = {
      hotelId: params.id,
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.OR = [
        {
          checkInDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        },
        {
          checkOutDate: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        }
      ];
    }

    // Add room type filter if provided
    if (roomType) {
      whereClause.roomType = {
        type: roomType
      };
    }

    // Fetch bookings with related data
    const bookings = await prisma.hotelBooking.findMany({
      where: whereClause,
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,
        bookingDate: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        roomType: {
          select: {
            type: true,
            pricePerNight: true
          }
        }
      },
      orderBy: {
        checkInDate: 'asc'
      }
    });

    return NextResponse.json(
      { bookings },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching hotel bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel bookings' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Get user from header
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const validatedUser = JSON.parse(userHeader);
    const userId = validatedUser.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user data" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { roomTypeId, checkInDate, checkOutDate } = body;

    if (!roomTypeId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify dates are valid
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();

    if (checkIn < now || checkOut <= checkIn) {
      return NextResponse.json(
        { error: "Invalid dates" },
        { status: 400 }
      );
    }

    // Check room type exists and belongs to this hotel
    const roomType = await prisma.roomType.findFirst({
      where: {
        id: roomTypeId,
        hotelId: params.id
      },
      include: {
        hotel: true,
        hotelBookings: {
          where: {
            status: "CONFIRMED",
            OR: [
              {
                checkInDate: {
                  lte: checkOut,
                  gte: checkIn
                }
              },
              {
                checkOutDate: {
                  lte: checkOut,
                  gte: checkIn
                }
              }
            ]
          }
        }
      }
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    // Check availability
    const bookedRooms = roomType.hotelBookings.length;
    if (bookedRooms >= roomType.quantity) {
      return NextResponse.json(
        { error: "No rooms available for selected dates" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.hotelBooking.create({
      data: {
        hotelId: params.id,
        roomId: roomTypeId,
        userId: userId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        status: "CONFIRMED"
      },
      include: {
        hotel: true,
        roomType: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Notify hotel owner
    const ownerUserId = await getUserIdByHotelOwnerId(roomType.hotel.ownerId);
    if (ownerUserId) {
      await sendNotification(
        ownerUserId,
        `New booking received for ${roomType.type} room at ${roomType.hotel.name} from ${booking.user.firstName} ${booking.user.lastName}`
      );
    }

    return NextResponse.json(
      { 
        message: "Booking created successfully",
        booking: {
          id: booking.id,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status,
          hotel: {
            id: booking.hotel.id,
            name: booking.hotel.name
          },
          roomType: {
            id: booking.roomType.id,
            type: booking.roomType.type
          }
        }
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
  { params }: { params: { bookingId: string } }
): Promise<NextResponse> {
  try {
    const bookingId = params.bookingId;

    // Get user from header
    const userHeader = request.headers.get("x-user");
    if (!userHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const validatedUser = JSON.parse(userHeader);
    const userId = validatedUser.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user data" },
        { status: 401 }
      );
    }

    // Get the booking details
    const booking = await prisma.hotelBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        hotel: true,
        roomType: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is already cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Check if user is authorized (either hotel owner or booking user)
    const isHotelOwner = await verifyHotelOwner(request, booking.hotelId);
    const isBookingUser = booking.userId === userId;

    if (!isHotelOwner && !isBookingUser) {
      return NextResponse.json(
        { error: "Unauthorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.hotelBooking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED"
      },
      select: {
        id: true,
        status: true,
        bookingDate: true,
        checkInDate: true,
        checkOutDate: true,
        roomType: {
          select: {
            type: true
          }
        },
        hotel: {
          select: {
            name: true
          }
        }
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        message: `Your booking for ${booking.hotel.name} (${booking.roomType.type}) has been cancelled.`,
      }
    });

    return NextResponse.json(
      { 
        message: "Booking cancelled successfully",
        booking: updatedBooking
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
