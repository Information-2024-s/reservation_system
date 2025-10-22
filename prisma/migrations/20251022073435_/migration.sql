-- DropForeignKey
ALTER TABLE "PlayerScore" DROP CONSTRAINT "PlayerScore_team_score_id_fkey";

-- AlterTable
ALTER TABLE "PlayerScore" ALTER COLUMN "team_score_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PlayerScore" ADD CONSTRAINT "PlayerScore_team_score_id_fkey" FOREIGN KEY ("team_score_id") REFERENCES "TeamScore"("id") ON DELETE SET NULL ON UPDATE CASCADE;
