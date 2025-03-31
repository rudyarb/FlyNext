import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { getHotelOwnerId, getUserIdByHotelOwnerId, ownsHotel, sendNotification } from "@utils/helpers";

// Retrieve bookings for a specific hotel
export async function GET(request, { params }) {
	try {
		const { searchParams } = new URL(request.url);
		const date = searchParams.get('date');
		const roomType = searchParams.get('roomType');
		if (date && isNaN(Date.parse(date))) {
			return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
		} else if (roomType && typeof roomType !== 'string') {
			return NextResponse.json({ error: 'Invalid room type' }, { status: 400 });
		}
		const { hotelId: hotelId } = await params;

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

		
		const filters = { hotelId: hotelId };
		if (date) {
			const startDate = new Date(date);
			startDate.setHours(0, 0, 0, 0);
			const endDate = new Date(date);
			endDate.setHours(23, 59, 59, 999);
			filters.bookingDate = {
				gte: startDate,
				lte: endDate,
			};
		}
		if (roomType) {
			filters.room = {
				type: roomType
			};
		}

		const hotelBookings = await prisma.hotelBooking.findMany({
			where: filters,
			include: {
				room: true  // Include room details in the response
			}
		});

		return NextResponse.json({ hotelBookings }, { status: 200, headers: { "Content-Type": "application/json" }});
	} catch (error) {
		console.log(error.stack)
		return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 });
	}
}

// Create a new booking
export async function POST(request, { params }) {
	try {
		const { roomId, checkInDate, checkOutDate } = await request.json();
		const { hotelId: hotelId } = await params;
		const userHeader = request.headers.get("x-user");
		if (!userHeader) {
			return NextResponse.json({ error: "Unauthorized or Invalid token" }, { status: 401 });
		}
		const user = JSON.parse(userHeader);
		const userId = user.id;
        
		// Check if the hotel exists -- also used to get hotelOwner ID
		const hotel = await prisma.hotel.findUnique({
			where: {
				id: hotelId,
			},
		});
		
		if (!hotel) {
			return NextResponse.json({ error: "Hotel not found" }, { status: 404, headers: { "Content-Type": "application/json" }});
		}
		const hotelOwnerUserId = await getUserIdByHotelOwnerId(hotel.ownerId);
		
		// Check if the room exists
		const room = await prisma.room.findUnique({
			where: {
				id: roomId,
			},
		});
		if (!room) {
			return NextResponse.json({ error: "Room not found" }, { status: 404, headers: { "Content-Type": "application/json" }});
		}

		// Validate required parameters
		if (!roomId || !checkInDate || !checkOutDate) {
			return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
		}

		// Create booking
		await prisma.hotelBooking.create({
			data: {
				hotelId: hotelId,
				roomId: roomId,
				userId: userId,
				checkInDate: new Date(checkInDate),
				checkOutDate: new Date(checkOutDate),
				status: "SCHEDULED",
			},
		});
		// Send a notification to the hotel owner
		sendNotification(hotelOwnerUserId, `A new booking has been made for room ${roomId} at your ${hotel.name} (ID: ${hotel.id}) from: ${checkInDate} to ${checkOutDate}.`);

		return NextResponse.json({ message: "Successfully created booking." }, { status: 200, headers: { "Content-Type": "application/json" } });
	} catch (error) {
		console.log(error.stack);
		return NextResponse.json({ error: 'Error creating booking' }, { status: 500 });
	}
}

// Mark a booking as cancelled
export async function PUT(request, { params }) {
	try {
		const { hotelId } = params;
		const { bookingId } = await request.json();
		if (!hotelId || !bookingId) {
			return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
		}

		const userHeader = request.headers.get("x-user");
		if (!userHeader) {
			return NextResponse.json({ error: "Unauthorized or Invalid token" }, { status: 401 });
		}
		const user = JSON.parse(userHeader);
		const userId = user.id;
		const hotelOwnerId = await getHotelOwnerId(userId);

		let booking;

		if (!hotelOwnerId) { // User is a customer
			booking = await prisma.hotelBooking.update({
				where: {
					id: bookingId,
					userId: userId,
				},
				data: {
					status: "CANCELLED",
				},
			});
		}
		else if (ownsHotel(hotelOwnerId, hotelId)) { // User owns the hotel
			booking = await prisma.hotelBooking.update({
				where: {
					id: bookingId,
				},
				data: {
					status: "CANCELLED",
				},
			});
		} else {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		if (!booking) {
			return NextResponse.json({ error: "Invalid booking" }, { status: 404 });
		} else {
			sendNotification(booking.userId, `Your booking with ID ${booking.id} has been cancelled.`);
		}

		return NextResponse.json({ message: "Successfully cancelled booking." }, { status: 200 });

	} catch (error) {
		return NextResponse.error();
	}
}

