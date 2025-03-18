/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Airport` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[city]` on the table `City` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Airport_id_key" ON "Airport"("id");

-- CreateIndex
CREATE UNIQUE INDEX "City_city_key" ON "City"("city");
