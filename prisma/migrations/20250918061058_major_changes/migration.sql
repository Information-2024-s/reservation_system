/*
  Warnings:

  - You are about to drop the column `teamId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `gameSessionId` on the `TeamScore` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `TeamScore` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `teamId` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `UserScore` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `team_id` to the `GameSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_id` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_session_id` to the `TeamScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_id` to the `TeamScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeamScore" DROP CONSTRAINT "TeamScore_gameSessionId_fkey";

-- DropForeignKey
ALTER TABLE "TeamScore" DROP CONSTRAINT "TeamScore_teamId_fkey";

-- DropForeignKey
ALTER TABLE "UserScore" DROP CONSTRAINT "UserScore_gameSessionId_fkey";

-- DropForeignKey
ALTER TABLE "UserScore" DROP CONSTRAINT "UserScore_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_teamId_fkey";

-- DropIndex
DROP INDEX "Reservation_teamId_idx";

-- DropIndex
DROP INDEX "TeamScore_gameSessionId_idx";

-- DropIndex
DROP INDEX "TeamScore_teamId_idx";

-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "team_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "teamId",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "userId",
ADD COLUMN     "reservation_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TeamScore" DROP COLUMN "gameSessionId",
DROP COLUMN "teamId",
ADD COLUMN     "game_session_id" INTEGER NOT NULL,
ADD COLUMN     "team_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "teamId",
ADD COLUMN     "team_id" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "UserScore";

-- CreateTable
CREATE TABLE "PlayerScore" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "team_score_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerScore_player_id_idx" ON "PlayerScore"("player_id");

-- CreateIndex
CREATE INDEX "PlayerScore_team_score_id_idx" ON "PlayerScore"("team_score_id");

-- CreateIndex
CREATE INDEX "TeamScore_team_id_idx" ON "TeamScore"("team_id");

-- CreateIndex
CREATE INDEX "TeamScore_game_session_id_idx" ON "TeamScore"("game_session_id");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "GameSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerScore" ADD CONSTRAINT "PlayerScore_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerScore" ADD CONSTRAINT "PlayerScore_team_score_id_fkey" FOREIGN KEY ("team_score_id") REFERENCES "TeamScore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
