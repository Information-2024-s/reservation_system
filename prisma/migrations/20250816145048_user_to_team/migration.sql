/*
  Warnings:

  - You are about to drop the column `userId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Score` table. All the data in the column will be lost.
  - Added the required column `teamId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_userId_fkey";

-- DropIndex
DROP INDEX "Reservation_userId_idx";

-- DropIndex
DROP INDEX "Score_userId_idx";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "userId",
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "userId",
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Reservation_teamId_idx" ON "Reservation"("teamId");

-- CreateIndex
CREATE INDEX "Score_teamId_idx" ON "Score"("teamId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
