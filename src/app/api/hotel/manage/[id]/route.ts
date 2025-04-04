import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userHeader = request.headers.get("x-user");
    
    if (!userHeader) {
      return NextResponse.json(
        { error: "Unauthorized - User not authenticated" },
        { status: 401 }
      );
    }

    const user = JSON.parse(userHeader);
    
    // Get hotel owner details
    const hotelOwner = await prisma.hotelOwner.findFirst({
      where: {
        userId: user.id
      }
    });
    
    if (!hotelOwner) {
      return NextResponse.json(
        { error: "Forbidden - User is not a hotel owner" },
        { status: 403 }
      );
    }

    // Get hotel details
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: id,
        ownerId: hotelOwner.id
      },
      include: {
        roomTypes: true
      }
    });

    if (!hotel) {
      return NextResponse.json(
        { error: "Hotel not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}