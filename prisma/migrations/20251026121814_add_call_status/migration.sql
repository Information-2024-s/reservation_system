-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('NOT_CALLED', 'CALLED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "callStatus" "CallStatus" NOT NULL DEFAULT 'NOT_CALLED',
ADD COLUMN "calledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Reservation_callStatus_idx" ON "Reservation"("callStatus");
