import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Fetch all cities from the database
  const cities = await prisma.city.findMany();
  if (cities.length === 0) {
    console.error("No cities found in the database. Please add cities first.");
    return;
  }

  // Create 10 ADMIN users and hotel owners first
  const hotelOwners = [];
  for (let i = 0; i < 10; i++) {
    const adminUser = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: "ADMIN",
      },
    });

    const hotelOwner = await prisma.hotelOwner.create({
      data: {
        userId: adminUser.id,
      },
    });
    hotelOwners.push(hotelOwner);
  }

  // Calculate total number of hotels to be created
  const totalHotels = cities.length * 2;
  let currentOwnerIndex = 0;

  // For each city, create 2 hotels
  for (const city of cities) {
    for (let i = 0; i < 2; i++) {
      // Get the current hotel owner (rotating through the list)
      const hotelOwner = hotelOwners[currentOwnerIndex];
      
      // Create a hotel associated with the HotelOwner in the current city
      const hotel = await prisma.hotel.create({
        data: {
          name: faker.company.name(),
          logo: faker.image.url(),
          address: faker.location.streetAddress(),
          city: city.city,
          starRating: faker.number.int({ min: 1, max: 5 }),
          images: faker.helpers.multiple(() => faker.image.url(), {
            count: faker.number.int({ min: 5, max: 7 })
          }),
          ownerId: hotelOwner.id,
        },
      });

      // Create 2-4 room types for the hotel
      const roomTypeCount = faker.number.int({ min: 2, max: 4 });
      for (let j = 0; j < roomTypeCount; j++) {
        await prisma.roomType.create({
          data: {
            type: faker.commerce.productName(),
            amenities: faker.helpers.multiple(() => 
              faker.helpers.arrayElement([
                "WiFi", "TV", "Air Conditioning", "Mini Bar", "Room Service"
              ]), 
              { count: faker.number.int({ min: 1, max: 5 }) }
            ),
            pricePerNight: Number(faker.number.float({ min: 50, max: 500, precision: 0.01 }).toFixed(2)),
            images: faker.helpers.multiple(() => faker.image.url(), {
              count: faker.number.int({ min: 5, max: 7 })
            }),
            hotelId: hotel.id,
            quantity: faker.number.int({ min: 5, max: 20 }),
            availability: faker.number.int({ min: 5, max: 20 }),
          },
        });
      }

      // Move to next owner, rotating back to the first if we reach the end
      currentOwnerIndex = (currentOwnerIndex + 1) % hotelOwners.length;
    }
  }

  console.log(`Created ${totalHotels} hotels distributed among 10 hotel owners.`);
  console.log(`Each owner manages approximately ${Math.ceil(totalHotels / 10)} hotels.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });