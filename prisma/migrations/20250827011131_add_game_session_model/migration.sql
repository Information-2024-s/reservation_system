/*
  Warnings:

  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_teamId_fkey";

-- AlterTable
ALTER TABLE "UserScore" ADD COLUMN     "gameSessionId" INTEGER;

-- DropTable
DROP TABLE "Score";

-- CreateTable
CREATE TABLE "GameSession" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamScore" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "gameSessionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamScore_teamId_idx" ON "TeamScore"("teamId");

-- CreateIndex
CREATE INDEX "TeamScore_gameSessionId_idx" ON "TeamScore"("gameSessionId");

-- CreateIndex
CREATE INDEX "UserScore_gameSessionId_idx" ON "UserScore"("gameSessionId");

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScore" ADD CONSTRAINT "UserScore_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
