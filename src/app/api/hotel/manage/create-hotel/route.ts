import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { getHotelOwnerId } from "@utils/helpers";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { name, logo, address, city, starRating, images } = await req.json();
	// Extract user object from headers
	const userHeader = req.headers.get("x-user");

	// Check if the userHeader is missing or invalid
	if (!userHeader) {
		return new NextResponse(
			JSON.stringify({ error: "Unauthorized or Invalid token" }),
			{ status: 401, headers: { "Content-Type": "application/json" } }
		);
	}

	let validatedUser;
	try {
		validatedUser = JSON.parse(userHeader); // Try to parse the header
	} catch (error) {
		return new NextResponse(
			JSON.stringify({ error: "Invalid user data" }),
			{ status: 401, headers: { "Content-Type": "application/json" } }
		);
	}

	const userId = validatedUser.id; // Ensure ID is extracted correctly

	// Ensure userId is valid
	if (!userId) {
		return new NextResponse(
			JSON.stringify({ error: "Unauthorized or Invalid token" }),
			{ status: 401, headers: { "Content-Type": "application/json" } }
		);
	}

	const hotelOwnerId = await getHotelOwnerId(userId);
	if (!hotelOwnerId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
	}

	if (!name || !address || !city || !starRating || !images) {
		return NextResponse.json(
			{ error: 'All fields are required' },
			{ status: 400 }
		);
	}

	try {
		const newHotel = await prisma.hotel.create({
			data: {
				name,
				logo,
				address,
				city,
				starRating,
				images,
				ownerId: hotelOwnerId	
			},
			select: {
				id: true,
				name: true,
				logo: true
			}
		});

		return NextResponse.json({ newHotelInfo: newHotel } as const,
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('Error creating hotel:', error);
		return NextResponse.json(
			{ error: 'Failed to create hotel' },
			{ status: 500 }
		);
	}
}
