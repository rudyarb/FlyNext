import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { getHotelOwnerId, ownsHotel } from "@utils/helpers";

// Get room availability for specific date ranges
export async function GET(request, { params }) {
	try {
		const { hotelId: hotelId } = await params;
		const { searchParams } = new URL(request.url);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const roomType = searchParams.get('roomType');
		if (!startDate || !endDate || !roomType) {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		} else if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
			return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
		} else if (new Date(startDate) > new Date(endDate)) {
			return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
		}

		// Extract user object from headers
		const userHeader = request.headers.get("x-user");

		// Check if the userHeader is missing or invalid
		if (!userHeader) {
			// console.log("User header is missing or empty");
			return new Response(
				JSON.stringify({ error: "Unauthorized or Invalid token" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		let validatedUser;
		try {
			validatedUser = JSON.parse(userHeader); // Try to parse the header
			// console.log("Parsed user:", validatedUser);
		} catch (error) {
			// console.log("Error parsing user header:", error);
			return new Response(
				JSON.stringify({ error: "Invalid user data" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		const userId = validatedUser.id; // Ensure ID is extracted correctly
		// console.log("User ID:", userId);

		// Ensure userId is valid
		if (!userId) {
			// console.log("User ID is invalid");
			return new Response(
				JSON.stringify({ error: "Unauthorized or Invalid token" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		const hotelOwnerId = await getHotelOwnerId(userId);
		if (!hotelOwnerId || !ownsHotel(hotelOwnerId, hotelId)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// See how many bookings exist for the given room type in the date range
		const bookings = await prisma.hotelBooking.findMany({
			where: {
				hotelId: hotelId,
				room: {
					type: roomType
				},
				checkInDate: {
					lte: new Date(endDate)
				},
				checkOutDate: {
					gte: new Date(startDate)
				},
			},
		});

		// Get total rooms of the given type in the hotel
		const totalRooms = await prisma.room.count({
			where: {
				hotelId: hotelId,
				type: roomType,
				
			},
		});

		const vacantRooms = totalRooms - bookings.length; // The number of available rooms in that date range of that type

		return NextResponse.json({ type: roomType, vacantRooms, totalRooms }, { status: 200, headers: { "Content-Type": "application/json" } });
	} catch (error) {
		console.log(error.stack);
		return NextResponse.json({ error: 'Error fetching room availability' }, { status: 500 });
	}
}
