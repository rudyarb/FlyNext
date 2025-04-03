import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getAFSFlights } from "@utils/helpers";

export async function GET(request) {
    try {
        // Based on request specifics, extract data
        const { searchParams } = new URL(request.url);
        const source = searchParams.get("source");
        const destination = searchParams.get("destination");
        const startDate = searchParams.get("startDate");
        const returnDate = searchParams.get("returnDate");
        let startFlights = null;
        let returnFlights = null;

        const citySourceResult = await prisma.city.findFirst({
            where: {
              city: source
            }
          });
          
        const airportSourceResult = await prisma.airport.findFirst({
            where: {
              code: source
            }
          });

        const cityDestResult = await prisma.city.findFirst({
            where: {
              city: destination
            }
          });
          
        const airportDestResult = await prisma.airport.findFirst({
            where: {
              code: destination
            }
          });

        if (!(citySourceResult || airportSourceResult)) {
            return new Response(
                JSON.stringify(`${source} is not in our database of cities and airports`),
                { status: 400, headers: { "Content-Type": "application/json" } }
              );
        }

        if (!(cityDestResult || airportDestResult)) {
            return new Response(
                JSON.stringify(`${destination} is not in our database of cities and airports`),
                { status: 400, headers: { "Content-Type": "application/json" } }
              );
        }

        if (!returnDate) {  // means that the flight is one way
            startFlights = await getAFSFlights(source, destination, startDate);
            return new Response(
                JSON.stringify({ startFlights }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
        }
        else {  // round trip flight
            startFlights = await getAFSFlights(source, destination, startDate);
            returnFlights = await getAFSFlights(destination, source, returnDate);
            return new Response(
                JSON.stringify({ startFlights, returnFlights }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              );
        }
    }
    catch (error) {
        // Deal with error
        return new Response(
            JSON.stringify({ error: "Something went wrong! Flights could not be found!"}),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
    }
}
