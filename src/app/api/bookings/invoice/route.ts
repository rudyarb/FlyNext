import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Define interfaces for better type organization
interface UserHeader {
  id: string;
  email: string;
  role: string;
}

interface Flight {
  flightId: string;
  flightNumber: string;
  departureTime: string;
  originCode: string;
  originName: string;
  originCity: string;
  originCountry: string;
  arrivalTime: string;
  destinationCode: string;
  destinationName: string;
  destinationCity: string;
  destinationCountry: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  status: string;
  airlineName: string;
}

interface Hotel {
  hotelId: string;
  roomId: string;
  bookingDate: Date;
  checkInDate: Date;
  checkOutDate: Date;
  status: string;
}

interface InvoiceData {
  invoiceNumber: string;
  bookingDate: Date;
  userFirstName: string;
  userLastName: string;
  itineraryId: string;
  flightsInfo: Flight[];
  hotelsInfo: Hotel[];
}

interface User {
  firstName: string;
  lastName: string;
  id: string;
}

export async function GET(request: Request): Promise<Response> {
  // Uncomment this when auth is done
  // Extract user object from headers
  const userHeader: string | null = request.headers.get("x-user");

  // Check if the userHeader is missing or invalid
  if (!userHeader) {
      // console.log("User header is missing or empty");
      return new Response(
          JSON.stringify({ error: "Unauthorized or Invalid token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
      );
  }

  let validatedUser: UserHeader;
  try {
      validatedUser = JSON.parse(userHeader); // Try to parse the header
      // console.log("Parsed user:", validatedUser);
  } catch (error) {
      // console.log("Error parsing user header:", error);
      return new Response(
          JSON.stringify({ error: "Invalid user data" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
      );
  }

  const userId: string = validatedUser.id; // Ensure ID is extracted correctly
  // console.log("User ID:", userId);

  // Ensure userId is valid
  if (!userId) {
      // console.log("User ID is invalid");
      return new Response(
          JSON.stringify({ error: "Unauthorized or Invalid token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
      );
  }

  try {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get('bookingId');

    if (!bookingId) {
      return new Response(JSON.stringify({error: "Booking ID is required"}), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get booking from DB
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        itinerary: {
          include: {
            flights: true, // Include flights inside itinerary
            hotels: true   // Include hotels inside itinerary
          }
        }
      }
    });

    if (!booking) {
      return new Response(JSON.stringify({error: "Booking not found"}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
        });
    }

    // Authenticate the user
    if (booking.userId != userId) {
      return new Response(
          JSON.stringify({ error: "Unauthorized or Invalid token" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Found booking by bookingId
    const { itinerary, bookingDate } = booking;

    if (!itinerary) {
      return new Response(JSON.stringify({error: "Itinerary not found"}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { flights, hotels } = itinerary;
    const itineraryId: string = itinerary.id;

    const user: User | null = await prisma.user.findUnique({
        where: { id: userId }
    });
    
    if (!user) {
      return new Response(JSON.stringify({error: "User not found"}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { firstName, lastName } = user;
    
    const flightsInfo: Flight[] = flights.map(flight => ({
      flightId: flight.flightId,
      flightNumber: flight.flightNumber,
      departureTime: flight.departureTime,
      originCode: flight.originCode,
      originName: flight.originName,
      originCity: flight.originCity,
      originCountry: flight.originCountry,
      arrivalTime: flight.arrivalTime,
      destinationCode: flight.destinationCode,
      destinationName: flight.destinationName,
      destinationCity: flight.destinationCity,
      destinationCountry: flight.destinationCountry,
      duration: flight.duration,
      price: flight.price,
      currency: flight.currency,
      availableSeats: flight.availableSeats,
      status: flight.status,
      airlineName: flight.airlineName
    }));

    const hotelsInfo: Hotel[] = hotels.map(hotel => ({
      hotelId: hotel.hotelId,
      roomId: hotel.roomId,
      bookingDate: hotel.bookingDate,
      checkInDate: hotel.checkInDate,
      checkOutDate: hotel.checkOutDate,
      status: hotel.status
    }));

    // Create doc object
    const doc = new PDFDocument({
      margin: 50,
      font: path.join(process.cwd(), 'public', 'fonts', 'Roboto-VariableFont_wdth,wght.ttf'),
    });

    const buffers: Buffer[] = [];
    // Pipe PDF data to buffer
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => console.log("PDF Generation Complete!"));

    // Collect booking details
    const invoiceData: InvoiceData = {
      invoiceNumber: `INV-${bookingId}`,
      bookingDate,
      userFirstName: firstName,
      userLastName: lastName,
      itineraryId,
      flightsInfo,
      hotelsInfo
    };

    // Generate Invoice
    doc.fontSize(20).text('Trip Booking Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice Number: ${invoiceData.invoiceNumber}`);
    doc.text(`Date of Booking: ${invoiceData.bookingDate}`);
    doc.moveDown();
    doc.text(`First Name: ${invoiceData.userFirstName}`);
    doc.moveDown();
    doc.text(`Last Name: ${invoiceData.userLastName}`);
    doc.moveDown();
    doc.text(`Itinerary ID: ${invoiceData.itineraryId}`);
    doc.moveDown();
    doc.text('Flight Details:', { underline: true });
    invoiceData.flightsInfo.forEach((flight) => {
        doc.moveDown();
        doc.text(`  Flight ID: ${flight.flightId}`);
        doc.text(`  Flight Number: ${flight.flightNumber}`);
        doc.text(`  Departure Time: ${flight.departureTime}`);
        doc.text(`  Origin: ${flight.originName} (${flight.originCode}), ${flight.originCity}, ${flight.originCountry}`);
        doc.text(`  Arrival Time: ${flight.arrivalTime}`);
        doc.text(`  Destination: ${flight.destinationName} (${flight.destinationCode}), ${flight.destinationCity}, ${flight.destinationCountry}`);
        doc.text(`  Duration: ${flight.duration} minutes`);
        doc.text(`  Price: ${flight.currency} ${flight.price}`);
        doc.text(`  Available Seats: ${flight.availableSeats}`);
        doc.text(`  Status: ${flight.status}`);
        doc.text(`  Airline: ${flight.airlineName}`);
    });
    doc.moveDown();
    doc.text('Hotel Details:', { underline: true });
    invoiceData.hotelsInfo.forEach((hotel) => {
        doc.moveDown();
        doc.text(`  Hotel ID: ${hotel.hotelId}`);
        doc.text(`  Room ID: ${hotel.roomId}`);
        doc.text(`  Booking Date: ${hotel.bookingDate}`);
        doc.text(`  Check-in Date: ${hotel.checkInDate}`);
        doc.text(`  Check-out Date: ${hotel.checkOutDate}`);
        doc.text(`  Status: ${hotel.status}`);
    });

    doc.end();

    const pdfBuffer: Buffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    console.log("PDF Buffer Length:", pdfBuffer.length);

    // Set up the file path and directory
    const directoryPath: string = path.join(process.cwd(), 'pdfs');
    
    // Make sure the directory exists
    await fs.promises.mkdir(directoryPath, { recursive: true });
    
    const filePath: string = path.join(directoryPath, `booking_${bookingId}.pdf`);
    
    // Write the PDF to the file system
    await fs.promises.writeFile(filePath, pdfBuffer);

    return new Response(pdfBuffer, {
      status: 200,
      headers: { 
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking_${bookingId}.pdf"`
      }
    });
  } 
  catch (error: any) {
    console.log(error.message);
    return new Response(JSON.stringify({error: "Invoice was not able to be generated"}), {
        status: 400,
        headers: { "Content-Type": "application/json" }
    });
  }
}
