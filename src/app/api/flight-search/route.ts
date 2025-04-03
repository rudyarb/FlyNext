import { PrismaClient, City, Airport } from "@prisma/client";
const prisma = new PrismaClient();
import { getAFSFlights } from "@utils/helpers";

interface Flight {
  // Define the structure of a flight object returned by getAFSFlights
  id: string;
  source: string;
  destination: string;
  date: string;
  price: number;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const source: string | null = searchParams.get("source");
    const destination: string | null = searchParams.get("destination");
    const startDate: string | null = searchParams.get("startDate");
    const returnDate: string | null = searchParams.get("returnDate");

    if (!source || !destination || !startDate) {
      return new Response(
        JSON.stringify({ error: "Missing required query parameters." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let startFlights: Flight[] | null = null;
    let returnFlights: Flight[] | null = null;

    const citySourceResult: City | null = await prisma.city.findFirst({
      where: { city: source },
    });

    const airportSourceResult: Airport | null = await prisma.airport.findFirst({
      where: { code: source },
    });

    const cityDestResult: City | null = await prisma.city.findFirst({
      where: { city: destination },
    });

    const airportDestResult: Airport | null = await prisma.airport.findFirst({
      where: { code: destination },
    });

    if (!(citySourceResult || airportSourceResult)) {
      return new Response(
        JSON.stringify({ error: `${source} is not in our database of cities and airports` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!(cityDestResult || airportDestResult)) {
      return new Response(
        JSON.stringify({ error: `${destination} is not in our database of cities and airports` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!returnDate) {
      // One-way flight
      startFlights = await getAFSFlights(source, destination, startDate);
      return new Response(
        JSON.stringify({ startFlights }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // Round-trip flight
      startFlights = await getAFSFlights(source, destination, startDate);
      returnFlights = await getAFSFlights(destination, source, returnDate);
      return new Response(
        JSON.stringify({ startFlights, returnFlights }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Something went wrong! Flights could not be found!" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
