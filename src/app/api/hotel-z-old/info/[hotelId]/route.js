import { prisma } from "@utils/db";
import { NextResponse } from "next/server";

// Get information about a specific hotel and its rooms
export async function GET(request, { params }) {
	try {
		const { hotelId: hotelId } = await params;

		const hotel = await prisma.hotel.findUnique({
			where: {
				id: hotelId,
			},
			include: {
				rooms: true,
			},
		});
		if (!hotel) {
			return NextResponse.json({ message: "Hotel not found" }, { status: 404, headers: { "Content-Type": "application/json" }});
		}

		return NextResponse.json({ hotel }, { status: 200, headers: { "Content-Type": "application/json" }});
	} catch (error) {
		return NextResponse.error({status: 500, message: "An error occurred while fetching the hotel information."});
	}
}