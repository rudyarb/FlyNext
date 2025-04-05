import { PrismaClient, Booking, Itinerary, FlightBooking, HotelBooking } from "@prisma/client";
import { validateCreditCard } from '@utils/helpers';

const prisma = new PrismaClient();

interface CreditCard {
    number: string; // Changed to string to match typical credit card number format
    expiryMonth: number;
    expiryYear: number;
}

interface RequestBody {
    creditCard: CreditCard;
}

interface UserHeader {
    id: string;
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    const { id: bookingId } = await params; // Await the params before using
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser: UserHeader;
    try {
        validatedUser = JSON.parse(userHeader) as UserHeader; // Explicit type assertion
    } catch {
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
        const body: RequestBody = await request.json();
        const { creditCard } = body;

        if (validateCreditCard(creditCard.number, creditCard.expiryMonth, creditCard.expiryYear)) {
            const itineraryToUpdate = await prisma.itinerary.findUnique({
                where: { bookingId },
                include: { flights: true, hotels: true }
            });

            if (!itineraryToUpdate) {
                return new Response(
                    JSON.stringify({ error: "Itinerary not found for this booking" }),
                    { status: 404, headers: { "Content-Type": "application/json" } }
                );
            }

            const updatedFlightBookings = await prisma.flightBooking.findMany({
                where: {
                    userId,
                    itineraryId: null,
                },
                select: { id: true }
            });

            const updatedHotelBookings = await prisma.hotelBooking.findMany({
                where: {
                    userId,
                    itineraryId: null,
                },
                select: { id: true }
            });

            const updatedData: {
                flights?: { connect: { id: string }[] };
                hotels?: { connect: { id: string }[] };
            } = {}; // Explicitly define the structure

            if (updatedFlightBookings.length > 0) {
                updatedData.flights = { connect: updatedFlightBookings.map(fb => ({ id: fb.id })) };
            }
            if (updatedHotelBookings.length > 0) {
                updatedData.hotels = { connect: updatedHotelBookings.map(hb => ({ id: hb.id })) };
            }

            await prisma.itinerary.update({
                where: { id: itineraryToUpdate.id },
                data: updatedData,
                include: {
                    flights: true,
                    hotels: true,
                }
            });

            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    itinerary: {
                        include: {
                            flights: true,
                            hotels: true,
                        },
                    }
                }
            });

            return new Response(
                JSON.stringify(booking),
                { status: 201, headers: { "Content-Type": "application/json" } }
            );
        } else {
            return new Response(
                JSON.stringify({ message: "Credit card details invalid" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch {
        return new Response(
            JSON.stringify({ error: "Booking was not found from <id>" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
    const { id: bookingId } = await params; // Await the params before using
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser: UserHeader;
    try {
        validatedUser = JSON.parse(userHeader) as UserHeader; // Explicit type assertion
    } catch {
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
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "CANCELLED",
                itinerary: {
                    update: {
                        status: "CANCELLED",
                    }
                }
            },
            include: { itinerary: true }
        });

        return new Response(
            JSON.stringify({ message: "Booking cancelled successfully!" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch {
        return new Response(
            JSON.stringify({ error: "Something went wrong! We could not cancel the booking." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}
