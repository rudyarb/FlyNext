import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { verifyHotelOwner } from "@/middleware/ownerAuth";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await verifyHotelOwner(request, params.id);
    if ('error' in auth) return auth.error;

    // Proceed with hotel update logic
    try {
        const data = await request.json();
        const updated = await prisma.hotel.update({
            where: { id: params.id },
            data
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update hotel" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await verifyHotelOwner(request, params.id);
    if ('error' in auth) return auth.error;

    // Proceed with hotel deletion logic
    try {
        await prisma.hotel.delete({
            where: { id: params.id }
        });
        return NextResponse.json(
            { message: "Hotel deleted successfully" }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete hotel" },
            { status: 500 }
        );
    }
}