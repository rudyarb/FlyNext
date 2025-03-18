import { prisma } from "@utils/db";
import { NextResponse } from "next/server";

// Get all of a user's notifications
export async function GET(request, { params }) {
	try {
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

		const notifications = await prisma.notification.findMany({
			where: {
				userId: userId,
			},
		});

		return NextResponse.json({ notifications }, { status: 200 });
	} catch (error) {
		return NextResponse.json( { error: "Internal Server Error" }, { status: 500 });
	}
}

// Mark a user's notification as read
export async function PUT(request, { params }) {
	try {
		const { notificationId }  = await request.json();
		const userHeader = request.headers.get("x-user");
		if (!userHeader) {
			return NextResponse.json({ error: "Unauthorized or Invalid token" }, { status: 401 });
		}
		const user = JSON.parse(userHeader);
		const userId = user.id;

		const read = await prisma.notification.updateMany({
			where: {
				id: notificationId,
				userId: userId,
			},
			data: {
				read: true,
			},
		});
		if (read.count === 0) {
			return NextResponse.json({ error: "Invalid notification or user" }, { status: 404 });
		}

		return NextResponse.json({ notifications: read }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
