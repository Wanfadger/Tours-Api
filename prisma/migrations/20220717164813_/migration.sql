/*
  Warnings:

  - Added the required column `duration` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxGroupSize` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'DIFFICULT');

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY',
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "endDates" TIMESTAMP(3)[],
ADD COLUMN     "imageCover" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "maxGroupSize" INTEGER NOT NULL,
ADD COLUMN     "priceDiscount" INTEGER,
ADD COLUMN     "ratingsAverage" DOUBLE PRECISION,
ADD COLUMN     "ratingsQuantity" INTEGER DEFAULT 0,
ADD COLUMN     "startDates" TIMESTAMP(3)[],
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
