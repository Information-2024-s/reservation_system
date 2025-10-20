/*
  Warnings:

  - You are about to drop the column `reservation_id` on the `Team` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerScore" DROP CONSTRAINT "PlayerScore_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_reservation_id_fkey";

-- AlterTable
ALTER TABLE "PlayerScore" ALTER COLUMN "player_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "reservation_id";

-- AddForeignKey
ALTER TABLE "PlayerScore" ADD CONSTRAINT "PlayerScore_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
