import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getHotelOwnerId } from "@utils/helpers";
import { uploadToCloudinary } from '@utils/cloudinary';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const starRating = Number(formData.get('starRating'));
    const logoFile = formData.get('logo') as File | null;
    const imageFiles = formData.getAll('images') as File[];

    // Extract user object from headers
    const userHeader = req.headers.get("x-user");

    if (!userHeader) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized or Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let validatedUser;
    try {
      validatedUser = JSON.parse(userHeader);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid user data" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = validatedUser.id;
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized or Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const hotelOwnerId = await getHotelOwnerId(userId);
    if (!hotelOwnerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!name || !address || !city || !starRating || imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Upload logo if provided
    let logoUrl = null;
    if (logoFile) {
      const result = await uploadToCloudinary(logoFile, 'logos');
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      logoUrl = result.url;
    }

    // Upload hotel images
    const imageUrls: string[] = [];
    for (const file of imageFiles) {
      const result = await uploadToCloudinary(file, 'hotel-images');
      if (result.success && result.url) {
        imageUrls.push(result.url);
      }
    }

    // Create hotel with Cloudinary URLs
    const newHotel = await prisma.hotel.create({
      data: {
        name,
        address,
        city,
        starRating,
        ownerId: hotelOwnerId,
        logoUrl,
        imageUrls
      }
    });

    return NextResponse.json({ newHotelInfo: newHotel }, { status: 200 });
  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}
