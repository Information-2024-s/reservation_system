-- AlterTable
ALTER TABLE "TeamScore" DROP COLUMN "gameSessionName";

-- DropIndex
DROP INDEX "TeamScore_gameSessionName_idx";
