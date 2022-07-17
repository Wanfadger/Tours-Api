/*
  Warnings:

  - Added the required column `price` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 4.5;
