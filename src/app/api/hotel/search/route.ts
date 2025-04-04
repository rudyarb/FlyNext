import { prisma } from "@utils/db";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

interface WhereClause {
  city: {
    contains: string;
    mode: 'insensitive';
  };
  name?: {
    contains: string;
    mode: 'insensitive';
  };
  starRating?: number;
}

interface HotelResponse {
  id: string;
  name: string;
  city: string;
  address: string;
  starRating: number;
  logoUrl: string | null;
  startingPrice: number;
  availableRooms: {
    id: string;
    type: string;
    pricePerNight: number;
    amenities: any;
  }[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const city = searchParams.get('city');
    const name = searchParams.get('name');
    const starRating = searchParams.get('starRating');
    const priceRange = searchParams.get('priceRange');

    // Add pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!checkIn || !checkOut || !city) {
      return NextResponse.json(
        { error: 'checkIn, checkOut, and city are required parameters' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    let whereClause: WhereClause = {
      city: {
        contains: city,
        mode: 'insensitive'
      }
    };

    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    if (starRating) {
      const rating = parseInt(starRating);
      if (!isNaN(rating)) {
        whereClause.starRating = rating;
      }
    }

    const hotels = await prisma.hotel.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        starRating: true,
        logoUrl: true,
        roomTypes: {
          select: {
            id: true,
            type: true,
            pricePerNight: true,
            amenities: true,
            hotelBookings: {
              where: {
                OR: [
                  {
                    AND: [
                      { checkInDate: { lte: checkOutDate } },
                      { checkOutDate: { gte: checkInDate } }
                    ]
                  }
                ],
                status: "CONFIRMED"
              }
            }
          }
        }
      }
    });

    // Get total count for pagination
    const total = await prisma.hotel.count({
      where: whereClause
    });

    // Process hotels to include only those with available rooms
    const availableHotels: HotelResponse[] = hotels
      .map(hotel => {
        const availableRooms = hotel.roomTypes
          .filter(roomType => roomType.hotelBookings.length === 0)
          .filter(roomType => {
            if (!priceRange) return true;
            const [min, max] = priceRange.split('-').map(Number);
            return !isNaN(min) && !isNaN(max) && 
                   roomType.pricePerNight >= min && 
                   roomType.pricePerNight <= max;
          })
          .map(({ hotelBookings, ...room }) => room);

        if (availableRooms.length === 0) return null;

        const startingPrice = Math.min(
          ...availableRooms.map(room => room.pricePerNight)
        );

        return {
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
          address: hotel.address,
          starRating: hotel.starRating,
          logoUrl: hotel.logoUrl,
          startingPrice,
          availableRooms
        };
      })
      .filter((hotel): hotel is HotelResponse => hotel !== null)
      .sort((a, b) => a.startingPrice - b.startingPrice);

    return NextResponse.json({
      hotels: availableHotels,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 400 }
    );
  }
}


