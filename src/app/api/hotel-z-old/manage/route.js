import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { getHotelOwnerId } from "@utils/helpers";

// Create a new hotel
export async function POST(request, { params }) {
	try{
		const { name, logo, address, location, starRating, images, rooms, hotelBookings } = await request.json();
		
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
		if (!hotelOwnerId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Validate required parameters
		if (!name || !address || !location || !starRating || !images) {
			return NextResponse.json({ error: "Missing required parameters." }, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		if (typeof name !== "string") {
			return NextResponse.json({ error: "Name must be a string." }, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		if (typeof address !== "string") {
			return NextResponse.json({ error: "Address must be a string." }, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		if (typeof location !== "string") {
			return NextResponse.json({ error: "Location must be a string." }, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		if (typeof starRating !== "number") {
			return NextResponse.json({ error: "Star rating must be a number." }, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		try {
			JSON.parse(JSON.stringify(images));
		} catch (error) {
			return NextResponse.json({ 
				error: "Images must be valid JSON." 
			}, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		if (!Array.isArray(rooms)) {
			return NextResponse.json({ error: "Rooms must be an array." }, { status: 400, headers: { "Content-Type": "application/json" }});
		}
		if (!Array.isArray(hotelBookings)) {
			return NextResponse.json({ error: "Bookings must be an array." }, { status: 400, headers: { "Content-Type": "application/json" }});
		}

		// Create the hotel
		await prisma.hotel.create({
			data: {
				name,
				logo,
				address,
				location,
				starRating,
				images,
				ownerId: hotelOwnerId,
				rooms: {
					create: rooms,
				},
				hotelBookings: {
					create: hotelBookings,
				},
			},
		});
		return NextResponse.json({ message: "Successfully created hotel." }, { status: 201, headers: { "Content-Type": "application/json" } });
	} catch (error) {
		return NextResponse.json(
			{ error: "An error occurred while creating the hotel." },
			{ status: 500, headers: { "Content-Type": "application/json" }}
		);
	}
}
