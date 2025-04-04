import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { writeFile, mkdir, access, readFile } from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Create a cache directory for downloaded images
const CACHE_DIR = path.join(process.cwd(), '.image-cache');

// Generate a hash for the URL to use as cache key
function getUrlHash(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

async function downloadAndSaveImage(url, hotelId, type, index = '') {
  try {
    // Create cache directory if it doesn't exist
    await mkdir(CACHE_DIR, { recursive: true });
    
    // Generate cache key and path
    const urlHash = getUrlHash(url);
    const cachePath = path.join(CACHE_DIR, `${urlHash}.jpg`);
    
    let imageBuffer;

    // Try to read from cache first
    try {
      await access(cachePath);
      imageBuffer = await readFile(cachePath);
      console.log(`Using cached image for ${url}`);
    } catch {
      // If not in cache, download and cache it
      console.log(`Downloading new image from ${url}`);
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(buffer);
      
      // Save to cache
      await writeFile(cachePath, imageBuffer);
    }
    
    // Create hotel's upload directory and save the file there
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'hotels', hotelId);
    await mkdir(uploadsDir, { recursive: true });
    
    const fileName = `${type}-${Date.now()}${index}.jpg`;
    const filePath = path.join(uploadsDir, fileName);
    
    await writeFile(filePath, imageBuffer);
    return `/uploads/hotels/${hotelId}/${fileName}`;
  } catch (error) {
    console.error(`Failed to process image from ${url}:`, error);
    return null;
  }
}

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
        password: "a",
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

  // Replace the existing hotel prefixes and suffixes with real hotel chains
  const hotelBrands = [
    'Marriott',
    'Hilton',
    'Hyatt',
    'Sheraton',
    'Westin',
    'Four Seasons',
    'Ritz-Carlton',
    'InterContinental',
    'W Hotels',
    'St. Regis'
  ];

  const hotelTypes = [
    'Hotel & Resort',
    'Grand Hotel',
    'Luxury Collection',
    'Executive Hotel',
    'Resort & Spa',
    'Boutique Hotel',
    'Plaza Hotel',
    'City Center'
  ];

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

  const hotelLogos = {
    'Marriott': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Marriott_International_logo.svg/2560px-Marriott_International_logo.svg.png',
    'Hilton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Hilton_Hotels_%26_Resorts_logo.svg/2560px-Hilton_Hotels_%26_Resorts_logo.svg.png',
    'Hyatt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Hyatt_logo.svg/2560px-Hyatt_logo.svg.png',
    'Sheraton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Sheraton_logo.svg/2560px-Sheraton_logo.svg.png',
    'Westin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Westin_Hotels_%26_Resorts_logo.svg/2560px-Westin_Hotels_%26_Resorts_logo.svg.png',
    'Four Seasons': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Four_Seasons_Hotels_and_Resorts_logo.svg/2560px-Four_Seasons_Hotels_and_Resorts_logo.svg.png',
    'Ritz-Carlton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Ritz_Carlton_Logo.svg/2560px-Ritz_Carlton_Logo.svg.png',
    'InterContinental': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/InterContinental_Hotels_Group_logo.svg/2560px-InterContinental_Hotels_Group_logo.svg.png',
    'W Hotels': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/W_Hotels_logo.svg/2560px-W_Hotels_logo.svg.png',
    'St. Regis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/St._Regis_Hotels_%26_Resorts_logo.svg/2560px-St._Regis_Hotels_%26_Resorts_logo.svg.png'
  };

  // Calculate total number of hotels to be created
  const totalHotels = cities.length * 2;
  let currentOwnerIndex = 0;

  // For each city, create 2 hotels
  for (const city of cities) {
    for (let i = 0; i < 2; i++) {
      const hotelOwner = hotelOwners[currentOwnerIndex];
      
      // Create hotel first with minimal data
      const hotelBrand = faker.helpers.arrayElement(hotelBrands);
      const hotel = await prisma.hotel.create({
        data: {
          name: `${hotelBrand} ${city.city} ${faker.helpers.arrayElement(hotelTypes)}`,
          logoPath: null,
          // Generate a realistic address
          address: `${faker.location.streetAddress()} ${faker.location.street()}`,
          city: city.city,
          starRating: faker.number.int({ min: 3, max: 5 }), // Most chain hotels are 3-5 stars
          imagePaths: [],
          ownerId: hotelOwner.id,
        },
      });

      // Download and save logo using the corresponding brand logo
      const logoUrl = hotelLogos[hotelBrand];
      const logoPath = await downloadAndSaveImage(logoUrl, hotel.id, 'logo');

      // Download and save hotel images
      const selectedHotelImages = faker.helpers.multiple(
        () => faker.helpers.arrayElement(hotelImages),
        { count: faker.number.int({ min: 5, max: 7 }) }
      );
      
      const imagePaths = await Promise.all(
        selectedHotelImages.map((url, index) => 
          downloadAndSaveImage(url, hotel.id, 'image', `-${index}`)
        )
      );

      // Update hotel with file paths
      await prisma.hotel.update({
        where: { id: hotel.id },
        data: {
          logoPath: logoPath,
          imagePaths: imagePaths.filter(path => path !== null)
        }
      });

      // Add room types and amenities
      const roomTypes = ['Deluxe Suite', 'Standard Room', 'Executive Suite', 'Family Room', 'Presidential Suite', 'Ocean View Room', 'Garden Suite'];
      const roomAmenities = [
        'Free WiFi', 'Flat-screen TV', 'Air Conditioning', 'Mini Bar', 'Room Service',
        'Coffee Maker', 'Safe', 'Balcony', 'Ocean View', 'King Size Bed',
        'Bathtub', 'Rain Shower', 'Work Desk', 'Lounge Area', 'Kitchen'
      ];

      // Create room types with downloaded images
      const roomTypeCount = faker.number.int({ min: 2, max: 4 });
      for (let j = 0; j < roomTypeCount; j++) {
        const selectedRoomImages = faker.helpers.multiple(
          () => faker.helpers.arrayElement(roomImages),
          { count: faker.number.int({ min: 5, max: 7 }) }
        );

        const roomImagePaths = await Promise.all(
          selectedRoomImages.map((url, index) => 
            downloadAndSaveImage(url, hotel.id, `room-${j}`, `-${index}`)
          )
        );

        await prisma.roomType.create({
          data: {
            type: faker.helpers.arrayElement(roomTypes),
            amenities: faker.helpers.multiple(
              () => faker.helpers.arrayElement(roomAmenities),
              { count: faker.number.int({ min: 3, max: 8 })}
            ),
            pricePerNight: Number(faker.number.float({ min: 100, max: 1000, precision: 0.01 }).toFixed(2)),
            images: roomImagePaths.filter(path => path !== null),
            hotelId: hotel.id,
            quantity: faker.number.int({ min: 5, max: 20 }),
            availability: faker.number.int({ min: 5, max: 20 }),
          },
        });
      }

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