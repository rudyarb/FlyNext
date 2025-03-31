import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { getHotelOwnerId, ownsHotel } from "@utils/helpers";

// Update a hotel
export async function PUT(request, { params }) {
	try { 
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

		// Check if any data was provided
		if (Object.keys(data).length === 0) {
			return NextResponse.json(
				{ error: "No update data provided." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		// Type validation only if the field exists
		if (data.name !== undefined && typeof data.name !== "string") {
			return NextResponse.json(
				{ error: "Name must be a string." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (data.address !== undefined && typeof data.address !== "string") {
			return NextResponse.json(
				{ error: "Address must be a string." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (data.location !== undefined && typeof data.location !== "string") {
			return NextResponse.json(
				{ error: "Location must be a string." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (data.starRating !== undefined && typeof data.starRating !== "number") {
			return NextResponse.json(
				{ error: "Star rating must be a number." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (data.ownerId !== undefined && typeof data.ownerId !== "number") {
			return NextResponse.json(
				{ error: "Owner ID must be a number." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (data.rooms !== undefined && !Array.isArray(data.rooms)) {
			return NextResponse.json(
				{ error: "Rooms must be an array." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}
		if (data.bookings !== undefined && !Array.isArray(data.bookings)) {
			return NextResponse.json(
				{ error: "Bookings must be an array." },
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Update the hotel
		await prisma.hotel.update({
			where: {
				id: hotelId,
				ownerId: hotelOwnerId,
			},
			data: {
				...data,
				// Handle nested updates only if provided
				...(data.rooms && {
					rooms: {
						upsert: data.rooms,
					}
				}),
				...(data.bookings && {
					bookings: {
						upsert: data.bookings,
					}
				}),
			},
		});

		return NextResponse.json({ message: "Successfully updated hotel information." }, { status: 200, headers: { "Content-Type": "application/json" } });
	} catch (error) {
		return NextResponse.json({ error: "An error occurred while updating the hotel." }, { status: 500, headers: { "Content-Type": "application/json" } });
	}
}

// // Delete a hotel
// export async function DELETE(request, { params }) {
// 	try {
//         const hotelId = params.hotelId;

// 		// Check if the hotel exists
// 		const hotelExists = await prisma.hotel.findUnique({
// 			where: {
// 				id: hotelId,
// 			},
// 		});
// 		if (!hotelExists) {
// 			return NextResponse.json({ error: "Hotel not found" }, { status: 404, headers: { "Content-Type": "application/json" }});
// 		}

// 		await prisma.hotel.delete({
// 			where: {
// 				id: hotelId,
// 			},
// 		});

// 		return NextResponse.json({ hotelId: hotelId }, { status: 200, message: "Success", headers: { "Content-Type": "application/json" } });
// 	} catch (error) {
// 		return NextResponse.json({ error: "An error occurred while deleting the hotel." }, { status: 500, headers: { "Content-Type": "application/json" } });
// 	}
// }
