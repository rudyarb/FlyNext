/*
  Warnings:

  - Added the required column `airlineName` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalTime` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `availableSeats` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureTime` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationCity` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationCode` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationCountry` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationName` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flightNumber` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCity` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCode` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originCountry` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originName` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Flight` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "airlineName" TEXT NOT NULL
);
INSERT INTO "new_Flight" ("id") SELECT "id" FROM "Flight";
DROP TABLE "Flight";
ALTER TABLE "new_Flight" RENAME TO "Flight";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
