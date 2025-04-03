import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { NextRequest, NextResponse } from "next/server";

interface ValidatedUser {
    id: string;
}

interface FlightBooking {
    id: string;
    userId: string;
    flightId: string;
    status: string;
}

interface AFSFlight {
    status: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const userHeader = request.headers.get("x-user");

    if (!userHeader) {
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    let validatedUser: ValidatedUser;
    try {
        validatedUser = JSON.parse(userHeader) as ValidatedUser;
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid user data" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    const userId = validatedUser.id;

    if (!userId) {
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized or Invalid token" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const url = new URL(request.url);
        const flightBookingId = url.searchParams.get("flightBookingId");

        if (!flightBookingId) {
            return new NextResponse(
                JSON.stringify({ error: "Flight booking ID is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const flightBooking = await prisma.flightBooking.findUnique({
            where: { id: flightBookingId },
        }) as FlightBooking | null;

        if (!flightBooking) {
            return new NextResponse(
                JSON.stringify({ error: "We could not find this booking" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (flightBooking.userId !== userId) {
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized or Invalid token" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const flightId = flightBooking.flightId.split("_").pop();
        if (!flightId) {
            return new NextResponse(
                JSON.stringify({ error: "Invalid flight ID format" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const afsResponse = await fetch(`https://advanced-flights-system.replit.app/api/flights/${flightId}`, {
            method: "GET",
            headers: {
                "x-api-key": "64a61055322c29c719f9ec0ae7ce7cbf6145316fa3001096c3fadc50a0582863",
                "Content-Type": "application/json",
            },
        });

        if (!afsResponse.ok) {
            return new NextResponse(
                JSON.stringify({ error: "Failed to fetch flight details from AFS API" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const afsFlight = (await afsResponse.json()) as AFSFlight;

        if (afsFlight.status === "SCHEDULED" && flightBooking.status === "SCHEDULED") {
            return new NextResponse(
                JSON.stringify({ message: "Your flight schedule has remained the same!" }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } else {
            await prisma.flightBooking.update({
                where: { id: flightBooking.id },
                data: { status: "CANCELLED" },
            });

            return new NextResponse(
                JSON.stringify({
                    message: "Your flight schedule has been cancelled! Please refresh the page to see the reflected change and update your booking accordingly!",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ error: "Something went wrong! We were not able to verify the flight" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }
}
