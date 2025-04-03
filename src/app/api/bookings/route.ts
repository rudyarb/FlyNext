import { PrismaClient, Booking, Itinerary, Hotel } from "@prisma/client";

const prisma = new PrismaClient();

interface User {
    id: string;
}

interface RequestWithHeaders extends Request {
    headers: Headers;
}

export async function GET(request: RequestWithHeaders): Promise<Response> {
    // Extract user object from headers
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser: User;
    try {
        validatedUser = JSON.parse(userHeader) as User;
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Invalid user data" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const userId = validatedUser.id;

    if (!userId) {
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                itinerary: {
                    include: {
                        flights: true,
                        hotels: true,
                    },
                },
            },
        });

        return new Response(JSON.stringify(bookings), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Something went wrong, could not get bookings. Try again later." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function DELETE(request: RequestWithHeaders): Promise<Response> {
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser: User;
    try {
        validatedUser = JSON.parse(userHeader) as User;
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Invalid user data" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const userId = validatedUser.id;

    if (!userId) {
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const { bookingId }: { bookingId: string } = await request.json();

        await prisma.booking.delete({
            where: { id: bookingId },
        });

        return new Response(
            JSON.stringify({ message: "The booking was deleted" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Something went wrong! Booking could not be deleted!" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}
