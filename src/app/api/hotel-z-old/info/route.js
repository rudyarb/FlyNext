import { prisma } from "@utils/db";
import { NextResponse } from "next/server";

// Search for hotels based on query parameters
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const checkInDate = searchParams.get("checkInDate");
        const checkOutDate = searchParams.get("checkOutDate");
        const location = searchParams.get("location");

        // Optional query parameters - Filters
        const name = searchParams.get("name");
        const starRating = searchParams.get("starRating");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        // Validate required parameters
        if (!checkInDate || !checkOutDate || !location) {
            return NextResponse.json(
                { message: "Missing required query parameters." },
                { status: 400 }
            );
        }
        if (isNaN(Date.parse(checkInDate)) || isNaN(Date.parse(checkOutDate))) {
            return NextResponse.json(
                { message: "Invalid date format. Please use YYYY-MM-DD." },
                { status: 400 }
            );
        } else if (new Date(checkInDate) >= new Date(checkOutDate)) {
            return NextResponse.json(
                { message: "Check-in date must be before check-out date." },
                { status: 400 }
            );
        } else if (location.length < 3) {
            return NextResponse.json(
                { message: "Location must be at least 3 characters long." },
                { status: 400 }
            );
        } else if (name && name.length < 3) {
            return NextResponse.json(
                { message: "Hotel name must be at least 3 characters long." },
                { status: 400 }
            );
        } else if (starRating && (isNaN(parseInt(starRating)) || parseInt(starRating) < 1 || parseInt(starRating) > 5)) {
            return NextResponse.json({ message: "Invalid star rating." }, { status: 400 });
        } else if (minPrice && isNaN(parseFloat(minPrice))) {
            return NextResponse.json({ message: "Invalid minimum price." }, { status: 400 });
        } else if (maxPrice && isNaN(parseFloat(maxPrice))) {
            return NextResponse.json({ message: "Invalid maximum price." }, { status: 400 });
        } else if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
            return NextResponse.json({ message: "Minimum price must be less than maximum price." }, { status: 400 });
        }

        const results = await prisma.hotel.findMany({
            where: {
                location: {
                    contains: location,
                },
                name: {
                    contains: name,
                },
                starRating: {
                    gte: starRating ? parseInt(starRating) : undefined,
                },
                rooms: {
                    some: {
                        available: true,
                        pricePerNight: {
                            gte: minPrice ? parseFloat(minPrice) : undefined,
                            lte: maxPrice ? parseFloat(maxPrice) : undefined,
                        },
                        hotelBookings: {
                            none: {
                                OR: [
                                    {
                                        checkInDate: {
                                            lte: new Date(checkOutDate),
                                        },
                                        checkOutDate: {
                                            gte: new Date(checkInDate),
                                        },
                                        status: {
                                            not: "CONFIRMED",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            include: {
                rooms: true,
            },
        });

        return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
        console.log(error.stack);
        return NextResponse.json({ message: "An error occurred while searching for hotels." }, { status: 500 });
    }
}
