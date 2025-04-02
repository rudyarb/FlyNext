import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { type, amenities, pricePerNight, images, hotelId, quantity } = await req.json();

        // Verify hotel owner using middleware
        const auth = await verifyHotelOwner(req, hotelId);
        if ('error' in auth) return auth.error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        // Validate required parameters
        if (!hotelId || !type || !pricePerNight || !quantity) {
            return NextResponse.json(
                { error: "Missing required parameters." },
                { status: 400 }
            );
        }

        // Type validation
        if (typeof type !== "string" || typeof pricePerNight !== "number") {
            return NextResponse.json(
                { error: "Invalid parameter types." },
                { status: 400 }
            );
        }

        // Format price to 2 decimal places
        const formattedPrice = Number(pricePerNight.toFixed(2));
        if (isNaN(formattedPrice) || formattedPrice < 0) {
            return NextResponse.json(
                { error: "Invalid price format or negative price." },
                { status: 400 }
            );
        }

        // Create the room
        const roomType = await prisma.roomType.create({
            data: {
                type,
                amenities: JSON.stringify(amenities),
                pricePerNight: formattedPrice, // Use formatted price
                images: JSON.stringify(images),
                quantity,
                availability: quantity,
                hotel: {
                    connect: { id: hotelId }
                }
            },
        });
        
        return NextResponse.json(
            { message: "Successfully created room.", roomType }, 
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating room type:', error);
        return NextResponse.json(
            { error: "An error occurred while creating the room." },
            { status: 500 }
        );
    }
}
