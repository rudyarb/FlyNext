import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";
import { saveFile } from "@utils/fileUpload";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    // Verify hotel owner
    const auth = await verifyHotelOwner(request, id);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, address, city, starRating, imagePaths } = data;

    // Input validation
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name format' }, { status: 400 });
    }
    if (address && typeof address !== 'string') {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
    }
    if (city && typeof city !== 'string') {
      return NextResponse.json({ error: 'Invalid city format' }, { status: 400 });
    }
    if (starRating && (!Number.isInteger(starRating) || starRating < 1 || starRating > 5)) {
      return NextResponse.json({ error: 'Invalid star rating' }, { status: 400 });
    }
    if (imagePaths && !Array.isArray(imagePaths)) {
      return NextResponse.json({ error: 'Invalid image paths format' }, { status: 400 });
    }

    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(city && { city }),
        ...(starRating && { starRating }),
        ...(imagePaths && { imagePaths }),
      },
    });

    return NextResponse.json(updatedHotel, { status: 200 });
  } catch (error) {
    console.error('Error updating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to update hotel' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    const auth = await verifyHotelOwner(request, id);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const logo = formData.get('logo') as File | null;
    const images = formData.getAll('images') as File[];

    // Handle logo upload
    if (logo) {
      const result = await saveFile(logo, id, 'logo');
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to upload logo' },
          { status: 500 }
        );
      }

      const updatedHotel = await prisma.hotel.update({
        where: { id },
        data: { logoPath: result.path },
        select: { logoPath: true }
      });

      return NextResponse.json(updatedHotel, { status: 200 });
    }

    // Handle multiple image uploads
    if (images.length) {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
        select: { imagePaths: true }
      });

      if (!hotel) {
        return NextResponse.json(
          { error: 'Hotel not found' },
          { status: 404 }
        );
      }

      const newPaths: string[] = [];
      for (const file of images) {
        const result = await saveFile(file, id, 'image');
        if (result.success && result.path) {
          newPaths.push(result.path);
        }
      }

      const updatedHotel = await prisma.hotel.update({
        where: { id },
        data: {
          imagePaths: [...hotel.imagePaths, ...newPaths]
        },
        select: { imagePaths: true }
      });

      return NextResponse.json(updatedHotel, { status: 200 });
    }

    return NextResponse.json(
      { error: 'No files provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}