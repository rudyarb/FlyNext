import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com
export async function fetchAndSaveAirports() {
    try {
        const fetchedAirports = await fetch("https://advanced-flights-system.replit.app/api/airports", {
            method: "GET",
            headers: { "x-api-key": "64a61055322c29c719f9ec0ae7ce7cbf6145316fa3001096c3fadc50a0582863" }
        });

        const airports = await fetchedAirports.json();

        for (const airport of airports) {
            await prisma.airport.upsert({
                where: { id: airport.id },
                update: {},
                create: {
                    id: airport.id,
                    name: airport.name,
                    code: airport.code,
                    country: airport.country,
                    city: airport.city }
            });
        }

        console.log("Airports saved successfully.");
    } 
    catch (error) {
        console.error("Error fetching airports:", error);
    }
}

fetchAndSaveAirports()