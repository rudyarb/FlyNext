import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getHotelOwnerId } from "@utils/helpers";
import { saveFile } from "@utils/fileUpload";

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

    // Create hotel first to get the ID
    const newHotel = await prisma.hotel.create({
      data: {
        name,
        address,
        city,
        starRating,
        ownerId: hotelOwnerId,
        logoPath: null,
        imagePaths: []
      }
    });

    // Save logo if provided
    let logoPath = null;
    if (logoFile) {
      const logoResult = await saveFile(logoFile, newHotel.id, 'logo');
      if (!logoResult.success) {
        await prisma.hotel.delete({ where: { id: newHotel.id } });
        return NextResponse.json({ error: logoResult.error }, { status: 400 });
      }
      logoPath = logoResult.path;
    }

    // Save all images
    const imagePaths: string[] = [];
    for (const file of imageFiles) {
      const imageResult = await saveFile(file, newHotel.id, 'image');
      if (!imageResult.success) {
        await prisma.hotel.delete({ where: { id: newHotel.id } });
        return NextResponse.json({ error: imageResult.error }, { status: 400 });
      }
      if (imageResult.path) {
        imagePaths.push(imageResult.path);
      }
    }

    // Update hotel with file paths
    const updatedHotel = await prisma.hotel.update({
      where: { id: newHotel.id },
      data: {
        logoPath,
        imagePaths
      },
      select: {
        id: true,
        name: true,
        logoPath: true
      }
    });

    return NextResponse.json({ newHotelInfo: updatedHotel },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}
