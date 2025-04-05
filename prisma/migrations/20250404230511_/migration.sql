/*
  Warnings:

  - You are about to drop the column `imagePaths` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `logoPath` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `RoomType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "imagePaths",
DROP COLUMN "logoPath",
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "RoomType" DROP COLUMN "images",
ADD COLUMN     "imageUrls" TEXT[];
