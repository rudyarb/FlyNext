import { PrismaClient, User, FlightBooking } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAFSFlights } from "@utils/helpers";

const prisma = new PrismaClient();

interface FlightBookingRequestBody {
    flightId: string;
    flightNumber: string;
    departureTime: string;
    originCode: string;
    originName: string;
    originCity: string;
    originCountry: string;
    arrivalTime: string;
    destinationCode: string;
    destinationName: string;
    destinationCity: string;
    destinationCountry: string;
    duration: number;
    price: number;
    currency: string;
    availableSeats: number;
    status: string;
    airlineName: string;
    passportNumber: string;
    email: string;
}

interface ValidatedUser {
    id: string;
    firstName: string;
    lastName: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return NextResponse.json(
            { error: "Unauthorized or Invalid token" },
            { status: 401 }
        );
    }

    let validatedUser: ValidatedUser;
    try {
        validatedUser = JSON.parse(userHeader);
    } catch {
        return NextResponse.json(
            { error: "Invalid user data" },
            { status: 401 }
        );
    }

    const userId = validatedUser.id;
    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized or Invalid token" },
            { status: 401 }
        );
    }

    try {
        const body: FlightBookingRequestBody = await request.json();
        const {
            flightId,
            flightNumber,
            departureTime,
            originCode,
            originName,
            originCity,
            originCountry,
            arrivalTime,
            destinationCode,
            destinationName,
            destinationCity,
            destinationCountry,
            duration,
            price,
            currency,
            availableSeats,
            status,
            airlineName,
            passportNumber,
            email,
        } = body;

        const user: User | null = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json(
                { error: "User was not found!" },
                { status: 404 }
            );
        }

        const AFS_API_KEY = "64a61055322c29c719f9ec0ae7ce7cbf6145316fa3001096c3fadc50a0582863";
        const url = "https://advanced-flights-system.replit.app/api/bookings";

        const bookingData = {
            email,
            firstName: user.firstName,
            lastName: user.lastName,
            passportNumber,
            flightId: [flightId],
        };

        try {
            await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": AFS_API_KEY,
                },
                body: JSON.stringify(bookingData),
            });
            console.log("Placed flight booking!");
        } catch {
            return NextResponse.json(
                { error: "Something went wrong! Flight booking could not be made!" },
                { status: 400 }
            );
        }

        const newFlightBooking: FlightBooking = await prisma.flightBooking.create({
            data: {
                flightId,
                flightNumber,
                departureTime,
                originCode,
                originName,
                originCity,
                originCountry,
                arrivalTime,
                destinationCode,
                destinationName,
                destinationCity,
                destinationCountry,
                duration,
                price,
                currency,
                availableSeats,
                status,
                airlineName,
                userId,
                passportNumber,
                email,
            },
        });

        return NextResponse.json(newFlightBooking, { status: 201 });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json(
            { error: "Something went wrong! Flight booking could not be made!" },
            { status: 400 }
        );
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return NextResponse.json(
            { error: "Unauthorized or Invalid token" },
            { status: 401 }
        );
    }

    let validatedUser: ValidatedUser;
    try {
        validatedUser = JSON.parse(userHeader);
    } catch {
        return NextResponse.json(
            { error: "Invalid user data" },
            { status: 401 }
        );
    }

    const userId = validatedUser.id;
    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized or Invalid token" },
            { status: 401 }
        );
    }

    try {
        const flightBookings: FlightBooking[] = await prisma.flightBooking.findMany({
            where: { userId, itinerary: null },
        });

        return NextResponse.json(flightBookings, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching flight bookings:", error);
        return NextResponse.json(
            { error: "Something went wrong! Could not fetch flight bookings." },
            { status: 400 }
        );
    }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return NextResponse.json(
            { error: "Unauthorized or Invalid token" },
            { status: 401 }
        );
    }

    let validatedUser: ValidatedUser;
    try {
        validatedUser = JSON.parse(userHeader);
    } catch {
        return NextResponse.json(
            { error: "Invalid user data" },
            { status: 401 }
        );
    }

    const userId = validatedUser.id;
    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized or Invalid token" },
            { status: 401 }
        );
    }

    try {
        const { flightBookingId }: { flightBookingId: string } = await request.json();

        await prisma.flightBooking.delete({
            where: { id: flightBookingId },
        });

        return NextResponse.json(
            { message: "The flight booking was cancelled successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error cancelling flight booking:", error);
        return NextResponse.json(
            { error: "Something went wrong! Flight booking could not be cancelled!" },
            { status: 400 }
        );
    }
}
