import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { getHotelOwnerId, ownsHotel, sendNotification } from "@utils/helpers";

// Update a room
export async function PUT(request, { params }) {
    try {
        const { type, amenities, pricePerNight, images, available, hotelBookings } = await request.json();
        const { hotelId: hotelId, roomId: roomId } = await params;
        if (!hotelId || !roomId) {
            return NextResponse.json(
                { message: "Missing required parameters: hotelId or roomId." },
                { status: 400 }
            );
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

        // Check if the room exists
        const roomExists = await prisma.room.findFirst({
            where: {
                id: roomId,
                hotelId: hotelId,
            },
        });
        if (!roomExists) {
            return NextResponse.json({ message: "Room not found." }, { status: 404 });
        }

        // Validate parameters
        if (type !== undefined && typeof type !== "string") {
            return NextResponse.json( { message: "Type must be a string." }, { status: 400 } );
        }
        if (pricePerNight !== undefined && typeof pricePerNight !== "number") {
            return NextResponse.json( { message: "Price per night must be a number." }, { status: 400 } );
        }
        try {
            if (amenities !== undefined) {
                JSON.parse(JSON.stringify(amenities));
            }
		} catch (error) {
			return NextResponse.json({ 
				error: "Amenities must be valid JSON." 
			}, { status: 400, headers: { "Content-Type": "application/json" }});
		}
        if (images !== undefined && !Array.isArray(images)) {
            return NextResponse.json( { message: "Images must be an array." }, { status: 400 } );
        }
        if (hotelBookings !== undefined && !Array.isArray(hotelBookings)) {
            return NextResponse.json( { message: "hotelBookings must be an array." }, { status: 400 } );
        }
        if (available !== undefined && typeof available !== "boolean") {
            return NextResponse.json( { message: "Availability must be a boolean." }, { status: 400 } );
        }

        // Update room
        await prisma.room.update({
            where: {
            id: roomId,
            hotelId: hotelId,
            },
            data: {
            ...(type !== undefined && { type }),
            ...(amenities !== undefined && { amenities }),
            ...(pricePerNight !== undefined && { pricePerNight: parseFloat(pricePerNight) }),
            ...(images !== undefined && { images }),
            ...(available !== undefined && { available }),
            ...(hotelBookings !== undefined && { hotelBookings: { upsert: hotelBookings } }),
            },
        });

        // Cancel bookings if room is no longer available
        if (available !== undefined && !available) {
            await prisma.hotelBooking.updateMany({
                where: {
                    roomId: roomId,
                },
                data: {
                    status: "CANCELLED",
                },
            });
            const cancelled = await prisma.hotelBooking.findMany({
                where: {
                    roomId: roomId,
                    status: "CANCELLED",
                },
            });
            for (const booking of cancelled) {
                await sendNotification(booking.userId, `Your booking for room ${booking.roomId} has been cancelled due to a change in availability.`);
            }
        }

        return NextResponse.json({ message: "Room successfully marked as unavailable. Related bookings have been cancelled." }, {status: 200, message: "Success", headers: { "Content-Type": "application/json" }});
    } catch (error) {
        console.log(error.stack);
        return NextResponse.json({ message: "An error occurred while updating the room." }, { status: 500 });
    }
}

// // Delete a room
// export async function DELETE(request, { params }) {
//     try {
//         const hotelId = params.hotelId;
//         const roomId = params.roomId;
//         if (!hotelId || !roomId) {
//             return NextResponse.json(
//                 { message: "Missing required parameters: hotelId or roomId." },
//                 { status: 400 }
//             );
//         } else if (isNaN(hotelId)) {
//             return NextResponse.json({ message: "Invalid hotel ID" }, { status: 400, headers: { "Content-Type": "application/json" } });
//         } else if (isNaN(roomId)) {
//             return NextResponse.json({ message: "Invalid room ID" }, { status: 400, headers: { "Content-Type": "application/json" } });
//         }

//         // Check if the room exists
//         const room = await prisma.room.findFirst({
//             where: {
//                 id: roomId,
//                 hotelId: hotelId,
//             },
//         });
//         if (!room) {
//             return NextResponse.json({ message: "Room not found." }, { status: 404 });
//         }

//         // TODO: Cancel all bookings for the room
//         // await prisma.booking.deleteMany({
//         //     where: {
//         //         roomId: roomId,
//         //     },
//         // });
        
//         // TODO: Send notification to affected users that their bookings got cancelled

//         // Delete the room
//         await prisma.room.delete({
//             where: {
//                 id: roomId,
//                 hotelId: hotelId,
//             },
//         });

//         return NextResponse.json({ roomId: roomId }, {status: 200, message: "Success", headers: { "Content-Type": "application/json" }});
//     } catch (error) {
//         console.log(error.stack);
//         return NextResponse.json({ message: "An error occurred while deleting the room." }, { status: 500 });
//     }
// }
