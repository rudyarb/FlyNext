import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

interface ValidatedUser {
  id: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: NextRequest) {
    const userHeader = request.headers.get("x-user");
    console.log("User Header:", userHeader);
    
      if (!userHeader) {
          return NextResponse.json(
              { error: "Unauthorized or Invalid token" },
              { status: 401 }
          );
      }
  
    let validatedUser: ValidatedUser;
    try {
        validatedUser = JSON.parse(userHeader);
    } catch {
        return NextResponse.json(
            { error: "Invalid user data" },
            { status: 401 }
        );
    }
    console.log("Validated User:", validatedUser);

    const userId = validatedUser.id;
    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized or Invalid token" },
            { status: 401 }
        );
    }
    console.log("User ID:", userId);

    try {
    // Parse request body
    const { hotelId, roomId, checkIn, checkOut } = await request.json();

    if (!hotelId || !roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    if (checkInDate < now || checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Invalid dates" },
        { status: 400 }
      );
    }

    // Check availability
    const roomType = await prisma.roomType.findFirst({
      where: {
        id: roomId,
        hotelId
      },
      include: {
        hotel: true,
        hotelBookings: {
          where: {
            status: "CONFIRMED",
            OR: [
              {
                checkInDate: {
                  lte: checkOutDate,
                  gte: checkInDate
                }
              },
              {
                checkOutDate: {
                  lte: checkOutDate,
                  gte: checkInDate
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

    // Verify availability
    if (roomType.hotelBookings.length >= roomType.quantity) {
      return NextResponse.json(
        { error: "No rooms available for selected dates" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.hotelBooking.create({
      data: {
        hotelId,
        roomId,
        userId,
        checkInDate,
        checkOutDate,
        status: "CONFIRMED"
      },
      // include: {
      //   hotel: true,
      //   roomTypeId: true
      // }
    });

    // Send notification to hotel owner
    const ownerUserId = await prisma.user.findFirst({
      where: {
        hotelOwner: {
          hotels: {
            some: {
              id: hotelId
            }
          }
        }
      },
      select: {
        id: true
      }
    });

    if (ownerUserId) {
      await prisma.notification.create({
        data: {
          userId: ownerUserId.id,
          message: `New booking received for ${roomType.type} room at ${roomType.hotel.name}`,
        }
      });
    }

    return NextResponse.json(
      {
        message: "Booking created successfully",
        bookingId: booking.id,
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