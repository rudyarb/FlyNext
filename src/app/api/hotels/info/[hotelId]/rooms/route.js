import { prisma } from "@utils/db";
import { NextResponse } from "next/server";

// Get room details for a hotel in a given date range
export async function GET(request, { params }) {
    try {
        const { hotelId: hotelId } = await params;
        const { searchParams } = new URL(request.url);
        const checkInDate = searchParams.get("checkInDate");
        const checkOutDate = searchParams.get("checkOutDate");

        // Check if the hotel exists
        const hotelExists = await prisma.hotel.findUnique({
            where: {
                id: hotelId,
            },
        });
        if (!hotelExists) {
            return NextResponse.json({ message: "Hotel not found" }, { status: 404 });
        }

        if (!checkInDate || !checkOutDate) {
            return NextResponse.json(
                { message: "Hotel ID, check-in date, and check-out date are required"}, { status: 400 });
        }
        if (isNaN(Date.parse(checkInDate)) || isNaN(Date.parse(checkOutDate))) {
            return NextResponse.json(
                { message: "Invalid date format. Please use YYYY-MM-DD." }, { status: 400 });
        } else if (new Date(checkInDate) >= new Date(checkOutDate)) {
            return NextResponse.json(
                { message: "Check-in date must be before check-out date." }, { status: 400 });
        }

        const rooms = await prisma.room.findMany({
            where: {
                hotelId: hotelId,
            },
        });

        return NextResponse.json({ rooms }, { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.log(error.stack);
        return NextResponse.error({ status: 500, message: "An error occurred while fetching room." });
    }
}
