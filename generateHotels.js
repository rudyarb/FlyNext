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

  // Add these hotel name prefixes
  const hotelPrefixes = ['Grand', 'Royal', 'Hotel', 'The', 'Plaza', 'Luxury', 'Sunset', 'Marina', 'Metropolitan', 'Continental'];
  const hotelSuffixes = ['Hotel & Spa', 'Resort', 'Suites', 'Inn', 'Palace', 'Lodge', 'House', 'Residences'];

  const hotelImages = [
    'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
    'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg',
    'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    'https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg',
    'https://images.pexels.com/photos/2598638/pexels-photo-2598638.jpeg',
    'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg',
    'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg',
    'https://images.pexels.com/photos/261388/pexels-photo-261388.jpeg',
    'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg',
    'https://images.pexels.com/photos/2506990/pexels-photo-2506990.jpeg',
    'https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg',
    'https://images.pexels.com/photos/2417278/pexels-photo-2417278.jpeg',
    'https://images.pexels.com/photos/2844474/pexels-photo-2844474.jpeg',
    'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg',
    'https://images.pexels.com/photos/2360569/pexels-photo-2360569.jpeg',
    'https://images.pexels.com/photos/4825701/pexels-photo-4825701.jpeg',
    'https://images.pexels.com/photos/5379219/pexels-photo-5379219.jpeg'
  ];

  const roomImages = [
    'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg',
    'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg',
    'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg',
    'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg',
    'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg',
    'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg',
    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
    'https://images.pexels.com/photos/3659683/pexels-photo-3659683.jpeg',
    'https://images.pexels.com/photos/3144580/pexels-photo-3144580.jpeg',
    'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg',
    'https://images.pexels.com/photos/3770866/pexels-photo-3770866.jpeg',
    'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg',
    'https://images.pexels.com/photos/6186815/pexels-photo-6186815.jpeg',
    'https://images.pexels.com/photos/6186830/pexels-photo-6186830.jpeg',
    'https://images.pexels.com/photos/6587907/pexels-photo-6587907.jpeg',
    'https://images.pexels.com/photos/7746549/pexels-photo-7746549.jpeg'
  ];

  const hotelLogos = [
    'https://placehold.co/400x300/gold/white?text=Luxury+Hotel',
    'https://placehold.co/400x300/darkblue/white?text=Premium+Hotel',
    'https://placehold.co/400x300/darkred/white?text=Resort+Hotel',
    'https://placehold.co/400x300/forest/white?text=Grand+Hotel'
  ];

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
          name: `${faker.helpers.arrayElement(hotelPrefixes)} ${faker.location.city()} ${faker.helpers.arrayElement(hotelSuffixes)}`,
          logo: faker.helpers.arrayElement(hotelLogos),
          address: faker.location.streetAddress(),
          city: city.city,
          starRating: faker.number.int({ min: 1, max: 5 }),
          images: faker.helpers.multiple(() => faker.helpers.arrayElement(hotelImages), {
            count: faker.number.int({ min: 5, max: 7 })
          }),
          ownerId: hotelOwner.id,
        },
      });

      // Add room types and amenities
      const roomTypes = ['Deluxe Suite', 'Standard Room', 'Executive Suite', 'Family Room', 'Presidential Suite', 'Ocean View Room', 'Garden Suite'];
      const roomAmenities = [
        'Free WiFi', 'Flat-screen TV', 'Air Conditioning', 'Mini Bar', 'Room Service',
        'Coffee Maker', 'Safe', 'Balcony', 'Ocean View', 'King Size Bed',
        'Bathtub', 'Rain Shower', 'Work Desk', 'Lounge Area', 'Kitchen'
      ];

      // Create 2-4 room types for the hotel
      const roomTypeCount = faker.number.int({ min: 2, max: 4 });
      for (let j = 0; j < roomTypeCount; j++) {
        await prisma.roomType.create({
          data: {
            type: faker.helpers.arrayElement(roomTypes),
            amenities: faker.helpers.multiple(
              () => faker.helpers.arrayElement(roomAmenities),
              { count: faker.number.int({ min: 3, max: 8 })}
            ),
            pricePerNight: Number(faker.number.float({ min: 100, max: 1000, precision: 0.01 }).toFixed(2)),
            images: faker.helpers.multiple(() => faker.helpers.arrayElement(roomImages), {
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