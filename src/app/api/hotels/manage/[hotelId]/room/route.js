import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { getHotelOwnerId, ownsHotel } from "@utils/helpers";

// Create a new room
export async function POST(request, { params }) {
	try {
		const { type, amenities, pricePerNight, images, hotelBookings } = await request.json();
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
		
		// Validate required parameters
		if (!hotelId || !type || !pricePerNight) {
			return NextResponse.json(
				{ error: "Missing required parameters." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (typeof type !== "string") {
			return NextResponse.json(
				{ error: "Type must be a string." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (typeof pricePerNight !== "number") {
			return NextResponse.json(
				{ error: "Price per night must be a number." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		try {
			JSON.parse(JSON.stringify(amenities));
		} catch (error) {
			return NextResponse.json({ 
				error: "Amenities must be valid JSON." 
			}, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		try {
			JSON.parse(JSON.stringify(images));
		} catch (error) {
			return NextResponse.json({ 
				error: "Images must be valid JSON." 
			}, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		if (hotelBookings !== undefined && !Array.isArray(hotelBookings)) {
			return NextResponse.json(
				{ error: "Bookings must be an array." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Create the room
		await prisma.room.create({
			data: {
				type,
				amenities,
				pricePerNight: parseFloat(pricePerNight),
				images,
				hotelId,
				hotelBookings: {
					create: hotelBookings,
				},
			},
		});
		
		return NextResponse.json({ message: "Successfully created room." }, { status: 201, headers: { "Content-Type": "application/json" } });
	} catch (error) {
		return NextResponse.error({
			status: 500,
			message: "An error occurred while creating the room.",
		});
	}
}
