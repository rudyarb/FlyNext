import { prisma } from '@utils/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('search')?.toLowerCase() || ''; // Convert query to lowercase

  try {
    const cities = await prisma.city.findMany({
      where: {
        city: {
          contains: query // Remove mode attribute
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
      const aCity = a.city.toLowerCase(); // Convert city to lowercase
      const bCity = b.city.toLowerCase();

      // Exact match gets highest priority
      if (aCity === query) return -1;
      if (bCity === query) return 1;

      // Starts with gets second priority
      const aStartsWith = aCity.startsWith(query);
      const bStartsWith = bCity.startsWith(query);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Alphabetical order for remaining results
      return aCity.localeCompare(bCity);
    });

    return NextResponse.json({ cities: sortedCities.slice(0, 10) }); // Return top 10 results
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}