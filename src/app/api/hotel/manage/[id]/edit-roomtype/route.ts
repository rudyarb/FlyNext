import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";
import { saveFile } from "@utils/fileUpload";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: hotelId } = await params;

  try {
    const formData = await request.formData();
    const roomTypeId = formData.get('roomTypeId') as string;
    const type = formData.get('type') as string;
    const pricePerNight = parseFloat(formData.get('pricePerNight') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const amenities = JSON.parse(formData.get('amenities') as string);
    const existingImages = JSON.parse(formData.get('existingImages') as string);
    const imageFiles = formData.getAll('images') as File[];

    // Verify hotel owner
    const isAuthorized = await verifyHotelOwner(request, hotelId);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Validate required fields
    if (!roomTypeId || !type || isNaN(pricePerNight) || isNaN(quantity)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get existing room type to check current quantity
    const existingRoomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        hotelBookings: {
          where: {
            status: "CONFIRMED",
          },
          orderBy: {
            bookingDate: 'desc'
          }
        }
      }
    });

    if (!existingRoomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    // If quantity is being reduced, check for overbookings
    if (quantity < existingRoomType.quantity) {
      // Get all date ranges where bookings exist
      const bookingRanges = await prisma.hotelBooking.groupBy({
        by: ['checkInDate', 'checkOutDate'],
        where: {
          roomId: roomTypeId,
          status: 'CONFIRMED',
        },
        _count: {
          id: true
        }
      });

      // For each date range, if bookings exceed new quantity, cancel most recent bookings
      for (const range of bookingRanges) {
        const overlappingBookings = await prisma.hotelBooking.findMany({
          where: {
            roomId: roomTypeId,
            status: 'CONFIRMED',
            AND: [
              { checkInDate: { lte: range.checkOutDate } },
              { checkOutDate: { gte: range.checkInDate } }
            ]
          },
          orderBy: {
            bookingDate: 'desc'
          }
        });

        if (overlappingBookings.length > quantity) {
          const bookingsToCancel = overlappingBookings.slice(0, overlappingBookings.length - quantity);
          
          for (const booking of bookingsToCancel) {
            await prisma.hotelBooking.update({
              where: { id: booking.id },
              data: { status: 'CANCELLED' }
            });

            // Send notification to user
            await prisma.notification.create({
              data: {
                userId: booking.userId,
                message: `Your booking for ${type} room has been cancelled due to reduced room availability.`,
                read: false
              }
            });
          }
        }
      }
    }

    // Handle new image uploads
    const newImagePaths = [];
    for (const file of imageFiles) {
      const result = await saveFile(file, hotelId, 'image');
      if (result.success && result.path) {
        newImagePaths.push(result.path);
      }
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newImagePaths];

    // Update room type
    const updatedRoomType = await prisma.roomType.update({
      where: {
        id: roomTypeId,
        hotelId: hotelId
      },
      data: {
        type,
        pricePerNight,
        quantity,
        amenities: amenities,
        images: allImages,
        availability: quantity
      }
    });

    return NextResponse.json(
      { message: "Room type updated successfully", roomType: updatedRoomType },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating room type:', error);
    return NextResponse.json(
      { error: "Failed to update room type" },
      { status: 500 }
    );
  }
}