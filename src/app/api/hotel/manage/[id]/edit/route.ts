import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";
import { saveFile } from "@utils/fileUpload";
import { uploadToCloudinary } from "@utils/cloudinary";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const auth = await verifyHotelOwner(request, id);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, address, city, starRating, imagePaths } = data;

    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name format' }, { status: 400 });
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
      const result = await uploadToCloudinary(logo, `logos/${id}`);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to upload logo' },
          { status: 500 }
        );
      }

      const updatedHotel = await prisma.hotel.update({
        where: { id },
        data: { logoUrl: result.url },
        select: { logoUrl: true }
      });

      return NextResponse.json(updatedHotel, { status: 200 });
    }

    // Handle multiple image uploads
    if (images.length) {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
        select: { imageUrls: true }
      });

      if (!hotel) {
        return NextResponse.json(
          { error: 'Hotel not found' },
          { status: 404 }
        );
      }

      const newUrls: string[] = [];
      for (const file of images) {
        const result = await uploadToCloudinary(file, `hotel-images/${id}`);
        if (result.success && result.url) {
          newUrls.push(result.url);
        }
      }

      const updatedHotel = await prisma.hotel.update({
        where: { id },
        data: {
          imageUrls: [...hotel.imageUrls, ...newUrls]
        },
        select: { imageUrls: true }
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