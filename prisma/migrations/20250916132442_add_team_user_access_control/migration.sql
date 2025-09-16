-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "lineUserId" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_lineUserId_idx" ON "Reservation"("lineUserId");

-- CreateIndex
CREATE INDEX "Team_lineUserId_idx" ON "Team"("lineUserId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_lineUserId_fkey" FOREIGN KEY ("lineUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_lineUserId_fkey" FOREIGN KEY ("lineUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
