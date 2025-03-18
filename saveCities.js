import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// OpenAI. (2025). ChatGPT (Version 4). Retrieved from https://openai.com
export async function fetchAndSaveCities() {
    try {
        const fetchedCities = await fetch("https://advanced-flights-system.replit.app/api/cities", {
            method: "GET",
            headers: { "x-api-key": "64a61055322c29c719f9ec0ae7ce7cbf6145316fa3001096c3fadc50a0582863" }
        });

        const cities = await fetchedCities.json();

        for (const city of cities) {
            await prisma.city.upsert({
                where: { city: city.city },
                update: {},
                create: { 
                    city: city.city, 
                    country: city.country }
            });
        }

        console.log("Cities saved successfully.");
    } 
    catch (error) {
        console.error("Error fetching cities:", error);
    }
}

fetchAndSaveCities()