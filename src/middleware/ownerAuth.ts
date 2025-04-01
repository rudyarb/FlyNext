import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getHotelOwnerId, ownsHotel } from "@utils/helpers";

export async function verifyHotelOwner(
    req: NextRequest,
    hotelId?: string
) {
    const userHeader = req.headers.get("x-user");
    
    if (!userHeader) {
        return {
            error: new NextResponse(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401 }
            )
        };
    }

    try {
        const validatedUser = JSON.parse(userHeader);
        const userId = validatedUser.id;
        
        if (!userId) {
            return {
                error: new NextResponse(
                    JSON.stringify({ error: "Invalid user data" }),
                    { status: 401 }
                )
            };
        }

        const hotelOwnerId = await getHotelOwnerId(userId);
        
        if (!hotelOwnerId) {
            return {
                error: new NextResponse(
                    JSON.stringify({ error: "Not a hotel owner" }),
                    { status: 403 }
                )
            };
        }

        if (hotelId && !await ownsHotel(hotelOwnerId, hotelId)) {
            return {
                error: new NextResponse(
                    JSON.stringify({ error: "Not authorized for this hotel" }),
                    { status: 403 }
                )
            };
        }

        return { ownerId: hotelOwnerId };
    } catch (error) {
        return {
            error: new NextResponse(
                JSON.stringify({ error: "Authentication failed" }),
                { status: 401 }
            )
        };
    }
}