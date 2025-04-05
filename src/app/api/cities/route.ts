import { prisma } from '@utils/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('search') || '';

  try {
    const cities = await prisma.city.findMany({
      where: {
        city: {
          contains: query,
          mode: 'insensitive' // Add case-insensitive search
        }
      },
      select: {
        city: true,
        country: true
      },
      orderBy: {
        city: 'asc' // Add basic alphabetical ordering
      },
      take: 10 // Limit to 10 results
    });

    // If no results found with exact search, try partial match
    if (cities.length === 0 && query.length > 0) {
      const partialMatches = await prisma.city.findMany({
        where: {
          OR: [
            {
              city: {
                contains: query,
                mode: 'insensitive'
              }
            },
            {
              city: {
                startsWith: query,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          city: true,
          country: true
        },
        orderBy: {
          city: 'asc'
        },
        take: 10
      });
      
      return NextResponse.json({ cities: partialMatches });
    }

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' }, 
      { status: 500 }
    );
  }
}