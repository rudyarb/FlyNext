/*
  Warnings:

  - Added the required column `email` to the `FlightBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportNumber` to the `FlightBooking` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlightBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flightId" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "originCode" TEXT NOT NULL,
    "originName" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "destinationCode" TEXT NOT NULL,
    "destinationName" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "airlineName" TEXT NOT NULL,
    "itineraryId" TEXT,
    "userId" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "FlightBooking_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlightBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FlightBooking" ("airlineName", "arrivalTime", "availableSeats", "currency", "departureTime", "destinationCity", "destinationCode", "destinationCountry", "destinationName", "duration", "flightId", "flightNumber", "id", "itineraryId", "originCity", "originCode", "originCountry", "originName", "price", "status", "userId") SELECT "airlineName", "arrivalTime", "availableSeats", "currency", "departureTime", "destinationCity", "destinationCode", "destinationCountry", "destinationName", "duration", "flightId", "flightNumber", "id", "itineraryId", "originCity", "originCode", "originCountry", "originName", "price", "status", "userId" FROM "FlightBooking";
DROP TABLE "FlightBooking";
ALTER TABLE "new_FlightBooking" RENAME TO "FlightBooking";
CREATE UNIQUE INDEX "FlightBooking_email_key" ON "FlightBooking"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
