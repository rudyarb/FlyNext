import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";
import { saveFile } from "@utils/fileUpload";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { params } = context;
    const hotelId = await Promise.resolve(params.id);
    const formData = await request.formData();

    // Extract form data
    const type = formData.get('type') as string;
    const pricePerNight = parseFloat(formData.get('pricePerNight') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    let amenities: string[];
    try {
      amenities = JSON.parse(formData.get('amenities') as string);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid amenities format" },
        { status: 400 }
      );
    }

    const imageFiles = formData.getAll('images') as File[];

    // Validate required fields
    if (!type || type.trim().length === 0) {
      return NextResponse.json(
        { error: "Room type name is required" },
        { status: 400 }
      );
    }

    if (isNaN(pricePerNight) || pricePerNight <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    if (!Array.isArray(amenities) || amenities.length === 0) {
      return NextResponse.json(
        { error: "At least one amenity is required" },
        { status: 400 }
      );
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Verify hotel owner
    const isAuthorized = await verifyHotelOwner(request, hotelId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Handle image uploads
    const imagePaths = [];
    for (const file of imageFiles) {
      const result = await saveFile(file, hotelId, 'image');
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to upload images" },
          { status: 400 }
        );
      }
      if (result.path) {
        imagePaths.push(result.path);
      }
    }

    // Create room type
    const roomType = await prisma.roomType.create({
      data: {
        type,
        pricePerNight,
        quantity,
        availability: quantity,
        amenities,
        images: imagePaths,
        hotelId
      }
    });

    return NextResponse.json(
      { message: "Room type created successfully", roomType },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating room type:', error);
    return NextResponse.json(
      { error: "Failed to create room type" },
      { status: 500 }
    );
  }
}
