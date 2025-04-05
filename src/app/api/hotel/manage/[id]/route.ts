import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

interface HotelResponse {
  id: string;
  name: string;
  city: string;
  address: string;
  starRating: number;
  logoUrl: string | null;
  imageUrls: string[];
  roomTypes: {
    id: string;
    type: string;
    pricePerNight: number;
    amenities: any;
    quantity: number;
    availability: number;
    imageUrls: string[]; // Fix: change from images to imageUrls to match schema
  }[];
}

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

    // Get hotel details with updated field names
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: id,
        ownerId: hotelOwner.id
      },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        starRating: true,
        logoUrl: true,      // Changed from logoPath
        imageUrls: true,    // Changed from imagePaths
        roomTypes: {
          select: {
            id: true,
            type: true,
            pricePerNight: true,
            amenities: true,
            quantity: true,
            availability: true,
            imageUrls: true  // Changed from images
          }
        }
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