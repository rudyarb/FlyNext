import { PrismaClient } from "@prisma/client";
import { validateCreditCard, sendNotification } from '@utils/helpers';

const prisma = new PrismaClient();

interface CreditCard {
    number: number;
    expiryMonth: number;
    expiryYear: number;
}

interface RequestBody {
    creditCard: CreditCard;
}

interface UserHeader {
    id: string;
}

export async function POST(request: Request): Promise<Response> {
    // Extract user object from headers
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        console.log("User header is missing or empty");
        return new Response(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser: UserHeader;
    try {
        validatedUser = JSON.parse(userHeader) as UserHeader;
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
        const body: RequestBody = await request.json();
        const { creditCard } = body;

        if (validateCreditCard(creditCard.number, creditCard.expiryMonth, creditCard.expiryYear)) {
            const flightBookings = await prisma.flightBooking.findMany({
                where: {
                    userId: userId,
                    itineraryId: null,
                },
            });

            const hotelBookings = await prisma.hotelBooking.findMany({
                where: {
                    userId: userId,
                    itineraryId: null,
                },
            });

            const newItinerary = await prisma.itinerary.create({
                data: {
                    status: "CONFIRMED",
                    flights: {
                        connect: flightBookings.map(flightBooking => ({ id: flightBooking.id }))
                    },
                    hotels: {
                        connect: hotelBookings.map(hotelBooking => ({ id: hotelBooking.id }))
                    }
                }
            });

            await prisma.flightBooking.updateMany({
                where: {
                    userId: userId,
                    itineraryId: null,
                },
                data: {
                    itineraryId: newItinerary.id,
                },
            });

            await prisma.hotelBooking.updateMany({
                where: {
                    userId: userId,
                    itineraryId: null,
                },
                data: {
                    itineraryId: newItinerary.id,
                },
            });

            const newBooking = await prisma.booking.create({
                data: {
                    status: "CONFIRMED",
                    itinerary: { connect: { id: newItinerary.id } },
                    userId: userId
                }
            });

            await prisma.itinerary.update({
                where: { id: newItinerary.id },
                data: { bookingId: newBooking.id },
            });

            await sendNotification(userId, `Itinerary confirmed (ID: ${newBooking.id})`);

            return new Response(JSON.stringify(newBooking), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ message: "Credit card details invalid" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.log(error.message);
        return new Response(
            JSON.stringify({ error: "Something went wrong, could not place booking. Try again later." }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
