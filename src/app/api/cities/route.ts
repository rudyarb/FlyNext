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
          mode: 'insensitive'
        }
      },
      select: {
        city: true,
        country: true
      },
      take: 20 // Increased to allow for sorting
    });

    // Sort results by relevance
    const sortedCities = cities.sort((a, b) => {
      // Exact match gets highest priority
      if (a.city.toLowerCase() === query.toLowerCase()) return -1;
      if (b.city.toLowerCase() === query.toLowerCase()) return 1;

      // Starts with gets second priority
      const aStartsWith = a.city.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.city.toLowerCase().startsWith(query.toLowerCase());
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Alphabetical order for remaining results
      return a.city.localeCompare(b.city);
    });

    return NextResponse.json({ cities: sortedCities.slice(0, 10) }); // Return top 10 results
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}