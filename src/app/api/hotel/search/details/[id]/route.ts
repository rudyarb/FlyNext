import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        // Await the params
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Hotel ID is required' } as const,
                { status: 400 }
            );
        }

        const hotel = await prisma.hotel.findUnique({
            where: { id },
            include: {
                roomTypes: true,
            },
        });

        return NextResponse.json(
            { hotelDetails: hotel } as const,
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Hotel details error:', error instanceof Error ? error.message : error);
        return NextResponse.json(
            { error: 'Failed to get hotel details' } as const,
            { status: 500 }
        );
    }
}

