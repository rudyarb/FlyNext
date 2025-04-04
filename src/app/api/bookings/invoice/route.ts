import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { PrismaClient, Booking, User, FlightBooking, HotelBooking } from "@prisma/client";

const prisma = new PrismaClient();

interface ValidatedUser {
  id: string;
}

interface FlightInfo {
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

interface HotelInfo {
  hotelId: string;
  roomId: string;
  bookingDate: Date;
  checkInDate: Date;
  checkOutDate: Date;
  status: string;
}

interface InvoiceData {
  invoiceNumber: string;
  bookingDate: string;
  userFirstName: string;
  userLastName: string;
  itineraryId: string;
  flightsInfo: FlightInfo[];
  hotelsInfo: HotelInfo[];
}

export async function GET(request: Request): Promise<Response> {
  const userHeader = request.headers.get("x-user");

  if (!userHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized or Invalid token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let validatedUser: ValidatedUser;
  try {
    validatedUser = JSON.parse(userHeader) as ValidatedUser;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid user data" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const userId = validatedUser.id;

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized or Invalid token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get('bookingId');

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "Booking ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        itinerary: {
          include: {
            flights: true,
            hotels: true,
          },
        },
      },
    });

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (booking.userId !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized or Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { itinerary, bookingDate } = booking;
    const { flights, hotels } = itinerary!;
    const itineraryId = itinerary!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const { firstName, lastName } = user;

    const flightsInfo: FlightInfo[] = flights.map((flight: FlightBooking) => ({
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
      airlineName: flight.airlineName,
    }));

    const hotelsInfo: HotelInfo[] = hotels.map((hotel: HotelBooking) => ({
      hotelId: hotel.hotelId,
      roomId: hotel.roomId,
      bookingDate: hotel.bookingDate,
      checkInDate: hotel.checkInDate,
      checkOutDate: hotel.checkOutDate,
      status: hotel.status,
    }));

    const invoiceData: InvoiceData = {
      invoiceNumber: `INV-${bookingId}`,
      bookingDate: bookingDate.toISOString(),
      userFirstName: firstName,
      userLastName: lastName,
      itineraryId: itineraryId,
      flightsInfo: flightsInfo,
      hotelsInfo: hotelsInfo,
    };

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => console.log("PDF Generation Complete!"));

    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-VariableFont_wdth,wght.ttf');
    doc.registerFont('Roboto', fontPath);
    doc.font('Roboto');

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

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    const directoryPath = path.join(process.cwd(), 'pdfs');
    await fs.promises.mkdir(directoryPath, { recursive: true });

    const filePath = path.join(directoryPath, `booking_${bookingId}.pdf`);
    await fs.promises.writeFile(filePath, pdfBuffer);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking_${bookingId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error(error.message);
    return new Response(
      JSON.stringify({ error: "Invoice was not able to be generated" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
