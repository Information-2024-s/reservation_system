/*
  Warnings:

  - You are about to drop the column `endTime` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfPeople` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `receiptNumber` on the `Reservation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[timeSlotId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('RESERVABLE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED');

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "endTime",
DROP COLUMN "numberOfPeople",
DROP COLUMN "receiptNumber",
ADD COLUMN     "timeSlotId" INTEGER;

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" SERIAL NOT NULL,
    "slotTime" TIMESTAMP(3) NOT NULL,
    "slotType" "SlotType" NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_slotTime_key" ON "TimeSlot"("slotTime");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_timeSlotId_key" ON "Reservation"("timeSlotId");

-- CreateIndex
CREATE INDEX "Reservation_timeSlotId_idx" ON "Reservation"("timeSlotId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
