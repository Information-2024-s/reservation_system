-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_lineUserId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
