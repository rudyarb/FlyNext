import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!hotelId || !roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch hotel and room details
    const roomType = await prisma.roomType.findFirst({
      where: { id: roomId, hotelId },
      include: {
        hotel: true,
        hotelBookings: {
          where: {
            status: "CONFIRMED",
            OR: [
              {
                checkInDate: {
                  lte: new Date(checkOut),
                  gte: new Date(checkIn)
                }
              },
              {
                checkOutDate: {
                  lte: new Date(checkOut),
                  gte: new Date(checkIn)
                }
              }
            ]
          }
        }
      }
    });

    if (!roomType) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check availability
    if (roomType.hotelBookings.length >= roomType.quantity) {
      return NextResponse.json(
        { error: 'Room not available for selected dates' },
        { status: 400 }
      );
    }

    // Calculate nights and total price
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nightsCount = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const bookingDetails = {
      hotelName: roomType.hotel.name,
      roomType: roomType.type,
      pricePerNight: roomType.pricePerNight,
      checkIn,
      checkOut,
      nightsCount,
      totalPrice: roomType.pricePerNight * nightsCount
    };

    return NextResponse.json(bookingDetails);

  } catch (error) {
    console.error('Error getting booking details:', error);
    return NextResponse.json(
      { error: 'Failed to get booking details' },
      { status: 500 }
    );
  }
}