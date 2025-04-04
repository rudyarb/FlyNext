import { prisma } from "@utils/db";
import { NextResponse } from "next/server";

// Get all of a user's notifications
// Define interfaces for better type organization
interface NotificationResponse {
	notifications?: Notification[];
	error?: string;
}

interface UserHeader {
	id: string;
	email: string;
	role: string;
}

interface Notification {
	id: string;
	userId: string;
	message: string;
	read: boolean;
	createdAt: Date;
}

export async function GET(request: Request): Promise<NextResponse<NotificationResponse>> {
	try {
		// Extract user object from headers
		const userHeader: string | null = request.headers.get("x-user");

		// Check if the userHeader is missing or invalid
		if (!userHeader) {
			// console.log("User header is missing or empty");
			return NextResponse.json(
				{ error: "Unauthorized or Invalid token" },
				{ status: 401 }
			);
		}

		let validatedUser: UserHeader;
		try {
			validatedUser = JSON.parse(userHeader); // Try to parse the header
			// console.log("Parsed user:", validatedUser);
		} catch (error) {
			// console.log("Error parsing user header:", error);
			return new NextResponse(
				JSON.stringify({ error: "Invalid user data" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		const userId: string = validatedUser.id; // Ensure ID is extracted correctly
		// console.log("User ID:", userId);

		// Ensure userId is valid
		if (!userId) {
			// console.log("User ID is invalid");
			return new NextResponse(
				JSON.stringify({ error: "Unauthorized or Invalid token" }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		const notifications: Notification[] = await prisma.notification.findMany({
			where: {
				userId: userId,
			},
		});

		return NextResponse.json({ notifications }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

// Mark a user's notification as read
// Define interfaces for better type organization
interface UpdateNotificationRequest {
	notificationId: string;
}

interface UpdateNotificationResponse {
	notifications?: { count: number };
	error?: string;
}

export async function PUT(request: Request): Promise<NextResponse<UpdateNotificationResponse>> {
	try {
		const { notificationId }: UpdateNotificationRequest = await request.json();
		const userHeader: string | null = request.headers.get("x-user");
		if (!userHeader) {
			return NextResponse.json({ error: "Unauthorized or Invalid token" }, { status: 401 });
		}
		const user: UserHeader = JSON.parse(userHeader);
		const userId: string = user.id;

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
