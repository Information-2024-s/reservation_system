/*
  Warnings:

  - You are about to drop the column `player_id` on the `PlayerScore` table. All the data in the column will be lost.
  - You are about to drop the column `game_session_id` on the `TeamScore` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `TeamScore` table. All the data in the column will be lost.
  - You are about to drop the `GameSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `playerName` to the `PlayerScore` table without a default value. This is not possible if the table is not empty.
  - Made the column `team_score_id` on table `PlayerScore` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `gameSessionName` to the `TeamScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `headcount` to the `TeamScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamName` to the `TeamScore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GameSession" DROP CONSTRAINT "GameSession_team_id_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_team_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerScore" DROP CONSTRAINT "PlayerScore_player_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerScore" DROP CONSTRAINT "PlayerScore_team_score_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamScore" DROP CONSTRAINT "TeamScore_game_session_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamScore" DROP CONSTRAINT "TeamScore_team_id_fkey";

-- DropIndex
DROP INDEX "PlayerScore_player_id_idx";

-- DropIndex
DROP INDEX "TeamScore_game_session_id_idx";

-- DropIndex
DROP INDEX "TeamScore_team_id_idx";

-- AlterTable
ALTER TABLE "PlayerScore" DROP COLUMN "player_id",
ADD COLUMN     "playerName" TEXT NOT NULL,
ALTER COLUMN "team_score_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "TeamScore" DROP COLUMN "game_session_id",
DROP COLUMN "team_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gameSessionName" TEXT NOT NULL,
ADD COLUMN     "headcount" INTEGER NOT NULL,
ADD COLUMN     "teamName" TEXT NOT NULL;

-- DropTable
DROP TABLE "GameSession";

-- DropTable
DROP TABLE "Player";

-- DropTable
DROP TABLE "Team";

-- CreateIndex
CREATE INDEX "PlayerScore_playerName_idx" ON "PlayerScore"("playerName");

-- CreateIndex
CREATE INDEX "TeamScore_teamName_idx" ON "TeamScore"("teamName");

-- CreateIndex
CREATE INDEX "TeamScore_gameSessionName_idx" ON "TeamScore"("gameSessionName");

-- AddForeignKey
ALTER TABLE "PlayerScore" ADD CONSTRAINT "PlayerScore_team_score_id_fkey" FOREIGN KEY ("team_score_id") REFERENCES "TeamScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
